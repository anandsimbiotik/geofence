import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GeofenceDocument = HydratedDocument<Geofence>;

@Schema()
export class Geofence {
  @Prop()
  name: string;

  @Prop()
  vehicalId: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[]]],
      required: true,
    },
  })
  geometry: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][];
  };
}

export const GeofenceSchema = SchemaFactory.createForClass(Geofence);

GeofenceSchema.index({ geometry: '2dsphere' });
