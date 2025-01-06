// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as turf from '@turf/turf';
// import { Geofence, GeofenceDocument } from './schemas/geofence.schema';
// import { CreateGeofenceDto } from './dto/create-geofence.dto';
// import { CheckPointDto } from './dto/check-point.dto';

// @Injectable()
// export class GeofenceService {
//   constructor(
//     @InjectModel(Geofence.name) private geofenceModel: Model<GeofenceDocument>,
//   ) {}

//   async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
//     let geometry;

//     if (createGeofenceDto.type === 'circle') {
//       // Convert circle to polygon
//       const center = turf.point(createGeofenceDto.center);
//       const circle = turf.circle(center, createGeofenceDto.radius / 1000); // radius in kilometers
//       geometry = circle.geometry;
//     } else {
//       // For polygon type
//       geometry = {
//         type: 'Polygon',
//         coordinates: [createGeofenceDto.coordinates],
//       };
//     }

//     const geofence = new this.geofenceModel({
//       name: createGeofenceDto.name,
//       type: createGeofenceDto.type,
//       geometry,
//       ...(createGeofenceDto.type === 'circle' && {
//         radius: createGeofenceDto.radius,
//         center: createGeofenceDto.center,
//       }),
//     });

//     return geofence.save();
//   }

//   async findAll(): Promise<Geofence[]> {
//     return this.geofenceModel.find().exec();
//   }

//   async checkPoint(checkPointDto: CheckPointDto): Promise<Geofence[]> {
//     return this.geofenceModel.find({
//       geometry: {
//         $geoIntersects: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [checkPointDto.longitude, checkPointDto.latitude],
//           },
//         },
//       },
//     }).exec();
//   }
// }







//redis service success
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Geofence, GeofenceDocument } from './schemas/geofence.schema';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { CheckPointDto } from './dto/check-point.dto';
import * as turf from '@turf/turf';

@Injectable()
export class GeofenceService {
  constructor(
    @InjectModel(Geofence.name) private geofenceModel: Model<GeofenceDocument>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache, // Inject Cache Manager
  ) { }

  async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
    let geometry;

    if (createGeofenceDto.type === 'circle') {
      const center = turf.point(createGeofenceDto.center);
      const circle = turf.circle(center, createGeofenceDto.radius / 1000);
      geometry = circle.geometry;
    } else {
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

    await geofence.save();

    // Cache the geofence in Redis
    await this.cacheManager.set(createGeofenceDto.name, geofence, 60);

    return geofence;
  }

  // async findAll(): Promise<Geofence[]> {
  //   return this.geofenceModel.find().exec();
  // }



  async findAll(): Promise<Geofence[]> {
    const cachedGeofences = await this.cacheManager.get<Geofence[]>('geofences');


    console.log("cachedGeofences", cachedGeofences)
    if (cachedGeofences) {
      console.log('Returning geofences from cache');
      return cachedGeofences;
    }

    const geofences = await this.geofenceModel.find().exec();

    await this.cacheManager.set('geofences', geofences, 60);

    console.log('Returning geofences from database and caching them');
    return geofences;
  }

  async checkPoint(checkPointDto: CheckPointDto): Promise<Geofence[]> {
    const cachedGeofences = await this.cacheManager.get<Geofence[]>(`geofences:${checkPointDto.latitude}:${checkPointDto.longitude}`);

    if (cachedGeofences) {
      return cachedGeofences;
    }

    const geofences = await this.geofenceModel.find({
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [checkPointDto.longitude, checkPointDto.latitude],
          },
        },
      },
    }).exec();

    await this.cacheManager.set(`geofences:${checkPointDto.latitude}:${checkPointDto.longitude}`, geofences, 60);

    return geofences;
  }
}








