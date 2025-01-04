import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Feature, Polygon } from '@turf/turf';

@Schema()
export class Geofence extends Document {
  @Prop()
  id: string;

  @Prop({ type: Object })
  polygon: Feature<Polygon>;
}

export const GeofenceSchema = SchemaFactory.createForClass(Geofence);
