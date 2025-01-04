import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeofenceModule } from './geofence/geofence.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://bholukagathara98:HfRyK1RhPvu2Gt7s@simbiotiktask.rhlui.mongodb.net/geofence',
    ),
    GeofenceModule,
  ],
})
export class AppModule { }
