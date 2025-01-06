
//redis success

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { MongooseModule } from '@nestjs/mongoose';
import { Geofence, GeofenceSchema } from './schemas/geofence.schema';
import { GeofenceController } from './geofence.controller';
import { GeofenceService } from './geofence.service';
import { RedisService } from './generic/redis.service'; // Import the RedisService

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Geofence.name, schema: GeofenceSchema }]),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 60
    }),
  ],
  controllers: [GeofenceController],
  providers: [GeofenceService, RedisService],
  exports: [RedisService],
})
export class GeofenceModule { }




