import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GeofenceDocument = Geofence & Document;

@Schema()
export class Geofence {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['circle', 'polygon'] })
  type: string;

  @Prop({ type: Object, required: true })
  geometry: {
    type: string;
    coordinates: number[][][] | number[][];
  };

  @Prop({ type: Number })
  radius?: number;

  @Prop({ type: [Number], index: '2dsphere' })
  center?: number[];
}

export const GeofenceSchema = SchemaFactory.createForClass(Geofence);
GeofenceSchema.index({ geometry: '2dsphere' });