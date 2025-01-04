import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Geofence } from './schemas/geofence.schema';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import * as turf from '@turf/turf';
import { CheckGeofenceDto } from './dto/check-geofence.dto';

@Injectable()
export class GeofenceService {
  constructor(@InjectModel(Geofence.name) private geofenceModel: Model<Geofence>) { }

  async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
    const { id, polygon } = createGeofenceDto;

    // Ensure the polygon is closed
    const firstCoordinate = polygon[0][0];
    const lastCoordinate = polygon[0][polygon[0].length - 1];
    if (
      firstCoordinate[0] !== lastCoordinate[0] ||
      firstCoordinate[1] !== lastCoordinate[1]
    ) {
      polygon[0].push(firstCoordinate); // Close the polygon
    }

    // Create the GeoJSON Polygon
    const geojsonPolygon = turf.polygon(polygon);

    // Save to database
    const newGeofence = new this.geofenceModel({
      id,
      polygon: geojsonPolygon,
    });

    return await newGeofence.save();
  }

  async getAllGeofences(): Promise<Geofence[]> {
    return this.geofenceModel.find().exec();
  }


  async getGeofenceIds(latitude: number, longitude: number): Promise<string[]> {
    const point = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const geofences = await this.geofenceModel.find().exec();

    const validGeofences = geofences.map((geofence) => {
      const polygon = geofence.polygon.geometry.coordinates;

      const firstCoordinate = polygon[0][0];
      const lastCoordinate = polygon[0][polygon[0].length - 1];
      if (
        firstCoordinate[0] !== lastCoordinate[0] ||
        firstCoordinate[1] !== lastCoordinate[1]
      ) {
        polygon[0].push(firstCoordinate);
      }

      return {
        ...geofence.toObject(),
        polygon: {
          type: "Polygon",
          coordinates: polygon,
        },
      };
    });

    // for (const geofence of validGeofences) {
    //   await this.geofenceModel.updateOne(
    //     { _id: geofence._id },
    //     { $set: { "polygon.geometry": geofence.polygon } }
    //   );
    // }

    const matchingGeofences = await this.geofenceModel
      .find({
        "polygon.geometry": {
          $geoIntersects: {
            $geometry: point,
          },
        },
      })
      .exec();

    return matchingGeofences.map((geofence) => geofence.id);
  }


}
