import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as turf from '@turf/turf';
import { Geofence, GeofenceDocument } from './schemas/geofence.schema';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { CheckPointDto } from './dto/check-point.dto';

@Injectable()
export class GeofenceService {
  constructor(
    @InjectModel(Geofence.name) private geofenceModel: Model<GeofenceDocument>,
  ) {}

  async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
    let geometry;

    if (createGeofenceDto.type === 'circle') {
      // Convert circle to polygon
      const center = turf.point(createGeofenceDto.center);
      const circle = turf.circle(center, createGeofenceDto.radius / 1000); // radius in kilometers
      geometry = circle.geometry;
    } else {
      // For polygon type
      geometry = {
        type: 'Polygon',
        coordinates: [createGeofenceDto.coordinates],
      };
    }

    const geofence = new this.geofenceModel({
      name: createGeofenceDto.name,
      type: createGeofenceDto.type,
      geometry,
      ...(createGeofenceDto.type === 'circle' && {
        radius: createGeofenceDto.radius,
        center: createGeofenceDto.center,
      }),
    });

    return geofence.save();
  }

  async findAll(): Promise<Geofence[]> {
    return this.geofenceModel.find().exec();
  }

  async checkPoint(checkPointDto: CheckPointDto): Promise<Geofence[]> {
    return this.geofenceModel.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [checkPointDto.longitude, checkPointDto.latitude],
          },
        },
      },
    }).exec();
  }
}