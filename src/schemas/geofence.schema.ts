// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from 'mongoose';

// export type GeofenceDocument = HydratedDocument<Geofence>;

// @Schema()
// export class Geofence {
//   @Prop()
//   name: string;

//   @Prop()
//   vehicleId: string;

//   @Prop({
//     type: {
//       type: String,
//       enum: ['Point', 'Polygon'],
//       required: true,
//     },
//     coordinates: {
//       type: [[[]]],
//       required: true,
//     },
//   })
//   location: {
//     type: 'Point' | 'Polygon';
//     coordinates: number[] | number[][][];
//   };
// }

// export const GeofenceSchema = SchemaFactory.createForClass(Geofence);

// GeofenceSchema.index({ geometry: '2dsphere' });




import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GeofenceDocument = HydratedDocument<Geofence>;

@Schema()
export class Geofence {
  @Prop()
  name: string;

  @Prop()
  vehicleId: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[]]], // Coordinates can be either a Point or a Polygon (nested arrays)
      required: true,
    },
  })
  location: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][]; // Coordinates will be an array of points or polygon
  };

  @Prop({ required: false }) // Add radius to schema (optional)
  radius?: number; // Radius for circle geofences
}

export const GeofenceSchema = SchemaFactory.createForClass(Geofence);

GeofenceSchema.index({ geometry: '2dsphere' }); // Index for geospatial queries
