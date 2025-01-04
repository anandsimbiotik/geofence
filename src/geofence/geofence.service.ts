import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Geofence } from './schemas/geofence.schema';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { CheckGeofenceDto } from './dto/check-geofence.dto';
import * as turf from '@turf/turf';

@Injectable()
export class GeofenceService {
  constructor(@InjectModel(Geofence.name) private geofenceModel: Model<Geofence>) { }

  async createGeofence(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
    const { type, latitude, longitude, radius, polygon } = createGeofenceDto;

    let geofenceData: any;

    if (type === GeofenceType.CIRCULAR) {
      if (!latitude || !longitude || !radius) {
        throw new BadRequestException('Latitude, longitude, and radius are required for circular geofences.');
      }
      const circle = turf.circle([longitude, latitude], radius / 1000, {
        steps: 64,
        units: 'kilometers',
      });
      geofenceData = { type, polygon: circle.geometry };
    } else if (type === GeofenceType.POLYGON) {
      if (!polygon) {
        throw new BadRequestException('Polygon coordinates are required for polygon geofences.');
      }
      geofenceData = { type, polygon };
    } else {
      throw new BadRequestException('Invalid geofence type.');
    }

    const geofence = new this.geofenceModel(geofenceData);
    return await geofence.save();
  }


  async getAllGeofences(): Promise<Geofence[]> {
    return await this.geofenceModel.find().exec();
  }

  async checkGeofence(checkGeofenceDto: CheckGeofenceDto): Promise<any[]> {
    const { latitude, longitude } = checkGeofenceDto;

    const matchingGeofences = await this.geofenceModel.find({
      $or: [
        {
          type: 'polygon',
          polygon: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
            },
          },
        },
        {
          type: 'circular',
          polygon: {
            $geoIntersects: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
            },
          },
        },
      ],
    }).exec();

    return matchingGeofences.map((geofence) => ({
      id: geofence._id,
      type: geofence.type,
    }));
  }
}
