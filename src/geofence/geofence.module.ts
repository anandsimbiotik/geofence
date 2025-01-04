import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeofenceController } from './geofence.controller';
import { GeofenceService } from './geofence.service';
import { Geofence, GeofenceSchema } from './schemas/geofence.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Geofence.name, schema: GeofenceSchema },
    ]),
  ],
  controllers: [GeofenceController],
  providers: [GeofenceService],
})
export class GeofenceModule {}