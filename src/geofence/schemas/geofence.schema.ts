// src/geofence/geofence.schema.ts
export enum GeofenceType {
  CIRCULAR = 'circular',
  POLYGON = 'polygon',
}

@Schema({ timestamps: true })
export class Geofence extends Document {
  @Prop({ required: true, enum: GeofenceType })
  type: GeofenceType;

  @Prop({ type: Object })
  polygon?: any;

  @Prop({ type: { type: String, enum: ['Point'], default: 'Point' } })
  location?: {
    type: string;
    coordinates: number[];
  };

  @Prop()
  radius?: number;
}

export const GeofenceSchema = SchemaFactory.createForClass(Geofence);
GeofenceSchema.index({ polygon: '2dsphere' });
GeofenceSchema.index({ location: '2dsphere' });
