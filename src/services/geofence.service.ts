// src/geofence/geofence.service.ts
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Redis } from 'ioredis';
import { createClient, RedisClientType, RediSearchSchema, SchemaFieldTypes } from 'redis';
import { CreateGeofenceDto } from '../dto/create-geofence.dto';
import { UpdateGeofenceDto } from '../dto/update-geofence.dto';
import { GeofenceRepository } from '../repositories/geofence.repository';
import { Geofence } from '../schemas/geofence.schema';
import { SetVehicleGeofenceStateDto } from 'src/dto/state.dto';



@Injectable()
export class GeofenceService {
  constructor(private readonly geofenceRepository: GeofenceRepository) { }

  private redis: RedisClientType

  async onModuleInit() {
    this.redis = createClient({
      socket: {
        host: 'redis-19872.c267.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 19872,
      },
      password: 'zaxzmNDk4r1v3f8o2QW5BBwCPSXwjb27'

    });
    await this.redis.connect();
    console.log('Redis connected');
  }



  async checkPoint(vehicleId: string, point: [number, number]): Promise<any> {
    const data = await this.geofenceRepository.checkPoint(point)
    const location = `POINT(${point[1]} ${point[0]})`;
    const result = await this.redis.ft.search('idx:geofence', `@location:[CONTAINS $bike] @vehicleId:${vehicleId}`, { PARAMS: { bike: location }, DIALECT: 3 });
    const redisKey = `vehicle:${vehicleId}:currentgeofences`;

    // Get all geofences stored for the vehicle in Redis
    const existingGeofences = await this.redis.hGetAll(redisKey);

    // Get the geofence IDs and data from the result
    const resultGeofences = result.documents.map((doc: any) => ({
      id: doc.id,
      name: doc.value["0"]?.name || 'undefined',
      geofenceData: doc.id,
      timestamp: new Date().toISOString(),
    }));

    // Loop through all geofences in Redis
    for (const [key, value] of Object.entries(existingGeofences)) {
      // If the geofence ID in Redis is not in the result, delete it
      if (!resultGeofences.some(geofence => geofence.id === key)) {
        await this.redis.hDel(redisKey, key); // Remove it from Redis
        console.log(`Removed geofence with ID ${key} from Redis.`);
      }
    }

    // Loop through the result geofences and add or update them in Redis
    for (const geofence of resultGeofences) {
      const value = JSON.stringify({
        name: geofence.name,
        geofenceData: geofence.geofenceData,
        timestamp: geofence.timestamp,
      });

      // Set or update geofence in Redis hash
      await this.redis.hSet(redisKey, geofence.id, value);
      console.log(`Updated/Added geofence with ID ${geofence.id} in Redis.`);
    }





    return result;
  }


  // Create a new geofence
  async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
    const geofence = await this.geofenceRepository.create(createGeofenceDto);

    const redisData = this.convertGeoJsonToRedisFormat(geofence);
    this.createIndex()
    console.log('Storing data in Redis:', redisData);
    await this.redis.json.set(redisData.key, '$', redisData.data);

    return geofence
  }

  // Find all geofences
  async findAll(): Promise<Geofence[]> {
    const geofences = await this.geofenceRepository.findAll();
    return geofences;
  }

  // Find a geofence by ID
  async findById(id: string): Promise<Geofence> {
    const geofence = await this.geofenceRepository.findById(id);
    if (!geofence) {
      throw new NotFoundException(`Geofence with ID ${id} not found`);
    }
    return geofence;
  }

  // Update a geofence by ID
  async update(id: string, updateGeofenceDto: UpdateGeofenceDto): Promise<Geofence> {
    const updatedGeofence = await this.geofenceRepository.update(id, updateGeofenceDto);
    const redisData = this.convertGeoJsonToRedisFormat(updatedGeofence);
    this.createIndex()

    await this.redis.json.set(redisData.key, '$', redisData.data);


    if (!updatedGeofence) {
      throw new NotFoundException(`Geofence with ID ${id} not found`);
    }
    return updatedGeofence;
  }

  // Delete a geofence by ID
  async remove(id: string): Promise<void> {
    await this.geofenceRepository.remove(id);
    const redisKey = `geofence:${id}`;
    console.log("redisKey", redisKey);

    // Delete the Redis data related to this geofence
    await this.redis.json.del(redisKey);
    console.log(`Geofence with ID ${id} removed from Redis and database`);
  }


  convertGeoJsonToRedisFormat(geoJson: any): any {
    const { type, coordinates } = geoJson.location;
    const uuid = geoJson.id;

    if (type === 'Polygon') {
      // Handle Polygon type
      const polygonString = coordinates[0]
        .map(coord => `${coord[0]} ${coord[1]}`)
        .join(', ');

      return {
        key: `geofence:${uuid}`,
        data: {
          id: uuid,
          vehicleId: geoJson.vehicleId,
          name: geoJson.name,
          location: `POLYGON ((${polygonString}))`,
        },
      };
    } else if (type === 'Circle') {
      // Handle Circle type
      const [longitude, latitude] = coordinates[0]; // center point of the circle
      const radius = geoJson.location.radius;

      return {
        key: `geofence:${uuid}`,
        data: {
          id: uuid,
          vehicleId: geoJson.vehicleId,
          name: geoJson.name,
          location: `CIRCLE (${longitude} ${latitude}, ${radius})`, // Circle representation
        },
      };
    } else {
      throw new Error('Unsupported geofence type');
    }
  }


  async createIndex() {
    const schema: RediSearchSchema = {
      '$.location': {
        type: SchemaFieldTypes.GEOSHAPE,
        AS: 'location',
      },
      '$.id': {
        type: SchemaFieldTypes.TEXT,
        AS: 'id',
      },
      '$.name': {
        type: SchemaFieldTypes.TEXT,
        AS: 'name',
      },
      '$.vehicleId': {
        type: SchemaFieldTypes.TEXT,
        AS: 'vehicleId',
      },
    };

    await this.redis.ft.info('idx:geofence').catch((err) => {
      this.redis.ft.create('idx:geofence', schema, { ON: 'JSON', PREFIX: 'geofence' }).then((res) => { console.log(res) }).catch((err) => { console.log(err) });
      console.log('Index created');
    });
  }



  async setVehicleGeofenceState(setVehicleGeofenceStateDto: SetVehicleGeofenceStateDto): Promise<void> {
    const key = `vehicle:${setVehicleGeofenceStateDto.vehicleId}:currentgeofence:${setVehicleGeofenceStateDto.geofenceId}`;

    const value = {
      name: setVehicleGeofenceStateDto.name,
      state: setVehicleGeofenceStateDto.state,
      timestamp: new Date().toISOString(),
    };

    // Store data in Redis
    await this.redis.hSet(key, value);
    // await this.redis.expire(key, 60);
  }

}






