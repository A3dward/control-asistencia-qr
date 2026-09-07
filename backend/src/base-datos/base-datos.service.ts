import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

const sql = require('mssql/msnodesqlv8');

@Injectable()
export class BaseDatosService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BaseDatosService.name);

  private conexion: any;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.conectar();
  }

  private async conectar() {
    const cadenaConexion =
      this.configService.get<string>('DB_CADENA');

    try {
      this.conexion =
        await new sql.ConnectionPool({
          connectionString: cadenaConexion,
        }).connect();

      this.logger.log(
        'Conexion correcta con SQL Server',
      );
    } catch (error) {
      this.logger.error(
        'Error al conectar con SQL Server',
      );

      throw error;
    }
  }

  obtenerConexion() {
    return this.conexion;
  }

  async ejecutarConsulta(
    consulta: string,
    parametros: Record<string, any> = {},
  ) {
    const solicitud = this.conexion.request();

    for (const [nombre, valor] of Object.entries(parametros)) {
      solicitud.input(nombre, valor);
    }

    return solicitud.query(consulta);
  }

  async onModuleDestroy() {
    if (this.conexion) {
      await this.conexion.close();
    }
  }
}