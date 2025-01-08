// src/geofence/geofence.service.ts
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Redis } from 'ioredis';
import { createClient, RedisClientType, RediSearchSchema, SchemaFieldTypes } from 'redis';
import { CreateGeofenceDto } from '../dto/create-geofence.dto';
import { UpdateGeofenceDto } from '../dto/update-geofence.dto';
import { GeofenceRepository } from '../repositories/geofence.repository';
import { Geofence } from '../schemas/geofence.schema';



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


  async checkPoint(vehicalId: string, point: [number, number]): Promise<any> {
    const checkPointfromDB = await this.geofenceRepository.checkPoint(point)
    const location = `POINT(${point[1]} ${point[0]})`;
    const result = await this.redis.ft.search('idx:geofence', `@location:[CONTAINS $bike] @vehicleId:${vehicalId}`, { PARAMS: { bike: location, vehicleId: vehicalId }, DIALECT: 3 });
    return result;
  }



  // Create a new geofence
  async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
    const geofence = await this.geofenceRepository.create(createGeofenceDto);

    const redisData = this.convertGeoJsonToRedisFormat(geofence);

    this.createIndex()

    // Here, you would store the data in Redis, using redisData.key and redisData.data
    console.log('Storing data in Redis:', redisData);

    // Example Redis set operation (this is just a placeholder)
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

  // async checkPoint(point: [number, number]): Promise<any> {
  //   //return geofences;
  //   const location = 'POINT(' + point[0] + ' ' + point[1] + ')'
  //   const result = await this.redis.ft.search('idx:geofence', `@geometry:[CONTAINS $point]`, { PARAMS: { point: location }, DIALECT: 3, RETURN: ['$.id', '$.name', '$.geometry'] });
  //   return result;
  // }


  convertGeoJsonToRedisFormat(geoJson: any): any {
    const coordinates = geoJson.geometry.coordinates[0];

    const polygonString = coordinates
      .map(coord => `${coord[0]} ${coord[1]}`)
      .join(', ');

    // Generate a unique UUID for the geofence
    const uuid = geoJson.id

    return {
      key: `geofence:${uuid}`,  // Redis key
      data: {
        id: uuid,
        vehicalId: geoJson.vehicalId,
        name: geoJson.name,  // Assuming the GeoJSON has a 'name' field
        geometry: `POLYGON ((${polygonString}))`,  // Formatted geometry
      },
    };
  }

  async createIndex() {
    const schema: RediSearchSchema = {
      '$.geometry': {
        type: SchemaFieldTypes.GEOSHAPE,
        AS: 'geometry',
      },
      '$.id': {
        type: SchemaFieldTypes.TEXT,
        AS: 'id',
      },
      '$.name': {
        type: SchemaFieldTypes.TEXT,
        AS: 'name',
      },
      '$.vehicalId': {
        type: SchemaFieldTypes.TEXT,
        AS: 'vehicalId',
      },
    };

    await this.redis.ft.info('idx:geofence').catch((err) => {
      this.redis.ft.create('idx:geofence', schema, { ON: 'JSON', PREFIX: 'geofence' }).then((res) => { console.log(res) }).catch((err) => { console.log(err) });
      console.log('Index created');
    });
  }
}
