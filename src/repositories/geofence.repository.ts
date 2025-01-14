import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Geofence, GeofenceDocument } from '../schemas/geofence.schema';
import { UpdateGeofenceDto } from '../dto/update-geofence.dto';
import { CreateGeofenceDto } from '../dto/create-geofence.dto';


@Injectable()
export class GeofenceRepository {
  constructor(
    @InjectModel(Geofence.name) private readonly geofenceModel: Model<GeofenceDocument>,
  ) { }

  // Create a new geofence
  // async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
  //   console.log("createGeofenceDto", createGeofenceDto)
  //   const newGeofence = new this.geofenceModel({
  //     name: createGeofenceDto.name,
  //     location: {
  //       type: "Polygon"
  //     },
  //     vehicleId: createGeofenceDto.vehicleId
  //   });

  //   if (createGeofenceDto.type === 'Polygon') {
  //     if (!Array.isArray(createGeofenceDto.geofencePolygon) || createGeofenceDto.geofencePolygon.length === 0) {
  //       throw new Error('Invalid coordinates. Coordinates should be an array of arrays.');
  //     }

  //     const firstRing = createGeofenceDto.geofencePolygon[0];

  //     if (firstRing[0][0] !== firstRing[firstRing.length - 1][0] ||
  //       firstRing[0][1] !== firstRing[firstRing.length - 1][1]) {
  //       firstRing.push(firstRing[0]);
  //     }

  //     newGeofence.location.coordinates = createGeofenceDto.geofencePolygon

  //   } else if (createGeofenceDto.type === 'Circle') {
  //     const circleCoordinates = await this.circleToPolygon(createGeofenceDto.centerpoint, createGeofenceDto.radius)
  //     newGeofence.location.coordinates = [circleCoordinates]

  //   } else {
  //     throw new Error('Invalid geofence type'); // Handle unexpected geofence types
  //   }

  //   console.log('Saved Geofence:', newGeofence);
  //   // Save the new geofence to the database
  //   return await newGeofence.save();
  // }




  async create(createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {

    const newGeofence = new this.geofenceModel({
      name: createGeofenceDto.name,
      vehicleId: createGeofenceDto.vehicleId,
      location: {
        type: createGeofenceDto.type === 'Circle' ? 'Point' : 'Polygon',
        coordinates: createGeofenceDto.type === 'Circle'
          ? [createGeofenceDto.centerpoint[0], createGeofenceDto.centerpoint[1]]
          : []
      },
      radius: createGeofenceDto.type === 'Circle' ? createGeofenceDto.radius : undefined
    });

    if (createGeofenceDto.type === 'Polygon') {
      if (!Array.isArray(createGeofenceDto.geofencePolygon) || createGeofenceDto.geofencePolygon.length === 0) {
        throw new Error('Invalid coordinates. Coordinates should be an array of arrays.');
      }

      const firstRing = createGeofenceDto.geofencePolygon[0];

      if (firstRing[0][0] !== firstRing[firstRing.length - 1][0] ||
        firstRing[0][1] !== firstRing[firstRing.length - 1][1]) {
        firstRing.push(firstRing[0]);
      }

      newGeofence.location.coordinates = createGeofenceDto.geofencePolygon;
    } else if (createGeofenceDto.type === 'Circle') {
    } else {
      throw new Error('Invalid geofence type');
    }


    const savedGeofence = await newGeofence.save();

    // Type assertion to inform TypeScript that `radius` exists on the saved geofence
    if (savedGeofence.location.type === 'Point' && (savedGeofence as Geofence).radius) {
      const circleCoordinates = await this.circleToPolygon(createGeofenceDto.centerpoint, createGeofenceDto.radius);
      savedGeofence.location.coordinates = [circleCoordinates];
      savedGeofence.location.type = 'Polygon';
    }

    return savedGeofence;
  }






  // Find all geofences
  async findAll(): Promise<Geofence[]> {
    return await this.geofenceModel.find().exec();
  }

  // Find a geofence by id
  async findById(id: string): Promise<Geofence> {
    return await this.geofenceModel.findById(id).exec();
  }

  // Update a geofence by id
  // async update(id: string, updateGeofenceDto: UpdateGeofenceDto): Promise<Geofence> {
  //   const geofenceToUpdate = await this.geofenceModel.findById(id).exec();
  //   if (!geofenceToUpdate) {
  //     throw new Error('Invalid id');
  //   }

  //   if (updateGeofenceDto.name) {
  //     geofenceToUpdate.name = updateGeofenceDto.name
  //   }

  //   if (updateGeofenceDto.type && updateGeofenceDto.type === 'Polygon') {
  //     if (updateGeofenceDto.geofencePolygon) {
  //       geofenceToUpdate.location.coordinates = updateGeofenceDto.geofencePolygon
  //       geofenceToUpdate.vehicleId = updateGeofenceDto.vehicleId
  //     }
  //   }
  //   else if (updateGeofenceDto.type && updateGeofenceDto.type === 'Circle') {
  //     if (updateGeofenceDto.centerpoint && updateGeofenceDto.radius) {
  //       const circleCoordinates = await this.circleToPolygon(updateGeofenceDto.centerpoint, updateGeofenceDto.radius)
  //       geofenceToUpdate.location.coordinates = [circleCoordinates]
  //       geofenceToUpdate.vehicleId = updateGeofenceDto.vehicleId

  //     }
  //   }

  //   const updatedGeofence = await geofenceToUpdate.save();

  //   return updatedGeofence;
  // }



  async update(id: string, updateGeofenceDto: UpdateGeofenceDto): Promise<Geofence> {
    const geofenceToUpdate = await this.geofenceModel.findById(id).exec();
    if (!geofenceToUpdate) {
      throw new Error('Invalid id');
    }

    // Update name if provided
    if (updateGeofenceDto.name) {
      geofenceToUpdate.name = updateGeofenceDto.name;
    }

    // Handle Polygon type update
    if (updateGeofenceDto.type && updateGeofenceDto.type === 'Polygon') {
      if (updateGeofenceDto.geofencePolygon) {
        geofenceToUpdate.location.coordinates = updateGeofenceDto.geofencePolygon;
        geofenceToUpdate.vehicleId = updateGeofenceDto.vehicleId;
      }
    } else if (updateGeofenceDto.type && updateGeofenceDto.type === 'Circle') {
      // Handle Circle type update
      if (updateGeofenceDto.centerpoint && updateGeofenceDto.radius) {
        // Ensure the centerpoint is an array with 2 elements
        const [longitude, latitude] = updateGeofenceDto.centerpoint;  // Destructure into separate variables

        // Store the circle in MongoDB as Point with radius (no conversion here)
        geofenceToUpdate.location.type = 'Point';
        geofenceToUpdate.location.coordinates = [longitude, latitude];
        geofenceToUpdate.radius = updateGeofenceDto.radius; // Store the radius in the geofence
        geofenceToUpdate.vehicleId = updateGeofenceDto.vehicleId;
      }
    }

    // Save the updated geofence
    const updatedGeofence = await geofenceToUpdate.save();

    // For Redis storage, convert the circle to a polygon if needed
    if (updatedGeofence.location.type === 'Point' && updatedGeofence.location.coordinates) {
      const [longitude, latitude] = updateGeofenceDto.centerpoint;

      // Convert the circle to a polygon for Redis storage using the radius
      const polygonCoordinates = await this.circleToPolygon([longitude, latitude], updatedGeofence.radius);

      // Ensure the polygonCoordinates is wrapped in the correct format for MongoDB Polygon type
      if (Array.isArray(polygonCoordinates) && Array.isArray(polygonCoordinates[0])) {
        // Convert to the polygon format for Redis storage
        updatedGeofence.location.coordinates = [polygonCoordinates]; // Wrap the coordinates in an additional array
        updatedGeofence.location.type = 'Polygon'; // Set the type to Polygon for Redis storage
      } else {
        throw new Error('Failed to convert circle to polygon. Invalid coordinates returned.');
      }
    }

    return updatedGeofence;
  }






  // Delete a geofence by id
  async remove(id: string): Promise<void> {
    await this.geofenceModel.findByIdAndDelete(id).exec();
  }

  async checkPoint(point: [number, number]): Promise<Geofence[]> {
    return await this.geofenceModel.find({
      location: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: point,
          },
        },
      },
    }).exec();
  }





  circleToPolygon(centerpoint: [number, number], radius: number) {
    const circleCoordinates: [number, number][] = [];
    const numSegments = 360; // Number of segments for approximating the circle

    // Angle increment for each segment
    const angleIncrement = (2 * Math.PI) / numSegments;

    for (let i = 0; i < numSegments; i++) {
      const angle = i * angleIncrement;
      const x = centerpoint[0] + radius * Math.cos(angle); // Calculate longitude (x)
      const y = centerpoint[1] + radius * Math.sin(angle); // Calculate latitude (y)
      circleCoordinates.push([x, y]);
    }
    // Make sure the first point is added again to close the polygon
    circleCoordinates.push(circleCoordinates[0]);
    // GeoJSON Polygon Feature
    return circleCoordinates;
  }
}
