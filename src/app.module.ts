import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Geofence, GeofenceSchema } from './schemas/geofence.schema';
import { GeofenceController } from './controllers/geofence.controller';
import { GeofenceService } from './services/geofence.service';
import { GeofenceRepository } from './repositories/geofence.repository';
import { BullModule } from '@nestjs/bull';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URL),

    MongooseModule.forFeature([{ name: Geofence.name, schema: GeofenceSchema }]),

    BullModule.forRoot({
      redis: {
        host: 'redis-19872.c267.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 19872,
        password: 'zaxzmNDk4r1v3f8o2QW5BBwCPSXwjb27',
        tls: {
          rejectUnauthorized: false,
        },
      },
    }),


    BullModule.registerQueue({
      name: 'test-queue',  // Queue name
    }),

  ],
  controllers: [AppController, GeofenceController],
  providers: [
    AppService,
    GeofenceService,
    GeofenceRepository,
  ],
  exports: [GeofenceRepository],
})
export class AppModule { }
