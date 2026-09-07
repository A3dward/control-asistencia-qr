import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  Pool,
  PoolClient,
} from 'pg';

@Injectable()
export class BaseDatosService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger =
    new Logger(BaseDatosService.name);

  private conexion!: Pool;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.conectar();
  }

  // =====================================
  // CONEXION POSTGRESQL
  // =====================================

  private async conectar() {
    const databaseUrl =
      this.configService.get<string>(
        'DATABASE_URL',
      );

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL no se encuentra configurado.',
      );
    }

    try {
      this.conexion = new Pool({
        connectionString:
          databaseUrl,
      });

      this.conexion.on(
        'error',
        (error) => {
          this.logger.error(
            'Error inesperado en la conexion con PostgreSQL.',
            error instanceof Error
              ? error.stack
              : undefined,
          );
        },
      );

      await this.conexion.query(
        'SELECT 1',
      );

      this.logger.log(
        'Conexion correcta con PostgreSQL',
      );
    } catch (error) {
      this.logger.error(
        'Error al conectar con PostgreSQL',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw error;
    }
  }

  // =====================================
  // OBTENER POOL
  // =====================================

  obtenerConexion() {
    return this.conexion;
  }

  // =====================================
  // CONVERTIR PARAMETROS
  //
  // @id
  // @correo
  //
  // a:
  //
  // $1
  // $2
  // =====================================

  private prepararConsulta(
    consulta: string,
    parametros: Record<
      string,
      any
    > = {},
  ) {
    const indices =
      new Map<
        string,
        number
      >();

    const valores:
      any[] =
      [];

    const texto =
      consulta.replace(
        /@([A-Za-z_][A-Za-z0-9_]*)/g,

        (
          _coincidencia,
          nombre:
            string,
        ) => {
          if (
            !Object.prototype.hasOwnProperty.call(
              parametros,
              nombre,
            )
          ) {
            throw new Error(
              `No se proporciono el parametro @${nombre}.`,
            );
          }

          let indice =
            indices.get(
              nombre,
            );

          if (!indice) {
            valores.push(
              parametros[
                nombre
              ],
            );

            indice =
              valores.length;

            indices.set(
              nombre,
              indice,
            );
          }

          return `$${indice}`;
        },
      );

    return {
      texto,
      valores,
    };
  }

  // =====================================
  // EJECUTAR CONSULTA
  // =====================================

  async ejecutarConsulta(
    consulta: string,
    parametros: Record<
      string,
      any
    > = {},
    cliente?:
      PoolClient,
  ) {
    const {
      texto,
      valores,
    } =
      this.prepararConsulta(
        consulta,
        parametros,
      );

    const ejecutor =
      cliente ??
      this.conexion;

    const resultado =
      await ejecutor.query(
        texto,
        valores,
      );

    /*
      Conservamos "recordset"
      para no tener que modificar
      toda la capa de servicios.
    */

    return {
      recordset:
        resultado.rows,

      rowsAffected: [
        resultado.rowCount ??
          0,
      ],
    };
  }

  // =====================================
  // TRANSACCIONES
  // =====================================

  async ejecutarTransaccion<T>(
    operacion: (
      cliente:
        PoolClient,
    ) => Promise<T>,
  ): Promise<T> {
    const cliente =
      await this.conexion.connect();

    try {
      await cliente.query(
        'BEGIN',
      );

      const resultado =
        await operacion(
          cliente,
        );

      await cliente.query(
        'COMMIT',
      );

      return resultado;
    } catch (error) {
      await cliente.query(
        'ROLLBACK',
      );

      throw error;
    } finally {
      cliente.release();
    }
  }

  // =====================================
  // CERRAR CONEXION
  // =====================================

  async onModuleDestroy() {
    if (this.conexion) {
      await this.conexion.end();
    }
  }
}