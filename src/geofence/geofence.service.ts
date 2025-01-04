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
    const point = turf.point([longitude, latitude]);

    const geofences = await this.geofenceModel.find().exec();

    const matchingGeofences = geofences.filter((geofence) => {
      const polygon = geofence.polygon.geometry.coordinates;

      const firstCoordinate = polygon[0][0];
      const lastCoordinate = polygon[0][polygon[0].length - 1];
      if (
        firstCoordinate[0] !== lastCoordinate[0] ||
        firstCoordinate[1] !== lastCoordinate[1]
      ) {
        polygon[0].push(firstCoordinate);
      }

      const turfPolygon = turf.polygon(polygon);
      return turf.booleanPointInPolygon(point, turfPolygon);
    });

    return matchingGeofences.map((geofence) => geofence.id);
  }
}
