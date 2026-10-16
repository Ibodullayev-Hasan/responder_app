import * as dotenv from 'dotenv';
dotenv.config({ path: ['.env.local'] })
import { Module } from '@nestjs/common';
import { InstagramModule } from './modules/instagram/instagram.module';
import { DatabaseConfig } from './db/config/db-config-types';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './db/mongoose-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './db/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from './db/config/db-config';
import appConfig from './config/app.config';
import { ConfigModule } from '@nestjs/config';

// <database-block>
const infrastructureDatabaseModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? MongooseModule.forRootAsync({
    useClass: MongooseConfigService,
  })
  : TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService,
    dataSourceFactory: async (options: DataSourceOptions) => {
      return new DataSource(options).initialize();
    },
  });
// </database-block>

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig,
      ],
      envFilePath: ['.env.local'],
    }),
    infrastructureDatabaseModule,
    InstagramModule,
  ],
})
export class AppModule { };