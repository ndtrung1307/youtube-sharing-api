import dotenv from 'dotenv';
import { join } from 'path';
import { cwd } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

const envFilePath = `.env.${process.env.NODE_ENV || 'local'}`;
dotenv.config({ path: envFilePath });

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [join(cwd(), '/src/**/*.entity.{ts,js}')],
  migrations: [join(cwd(), '/src/migrations/*.{ts,js}')],
  migrationsTableName: 'migration',
  synchronize: false,
  dropSchema: false,
};
export default new DataSource(options);
