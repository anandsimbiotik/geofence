// import { IsString, IsNumber, IsArray, IsEnum, ValidateIf } from 'class-validator';

// export class CreateGeofenceDto {
//   @IsString()
//   name: string;

//   @IsEnum(['circle', 'polygon'])
//   type: string;

//   @ValidateIf(o => o.type === 'circle')
//   @IsNumber()
//   radius?: number;

//   @ValidateIf(o => o.type === 'circle')
//   @IsArray()
//   center?: number[];

//   @ValidateIf(o => o.type === 'polygon')
//   @IsArray()
//   coordinates?: number[][];
// }


import { IsString, IsNumber, IsArray, IsEnum, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGeofenceDto {
  @ApiProperty({
    description: 'The name of the geofence',
    example: 'Mumbai Circle',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The type of the geofence',
    enum: ['circle', 'polygon'],
    example: 'circle',
  })
  @IsEnum(['circle', 'polygon'])
  type: string;

  @ApiPropertyOptional({
    description: 'The radius of the circle in meters (required for circle geofences)',
    example: 1000,
  })
  @ValidateIf(o => o.type === 'circle')
  @IsNumber()
  radius?: number;

  @ApiPropertyOptional({
    description: 'The center of the circle geofence as [longitude, latitude] (required for circle geofences)',
    example: [72.8777, 19.0760],
    type: [Number],
  })
  @ValidateIf(o => o.type === 'circle')
  @IsArray()
  center?: number[];

  @ApiPropertyOptional({
    description: 'The coordinates of the polygon geofence as an array of [longitude, latitude] points (required for polygon geofences)',
    example: [
      [72.8777, 19.0760],
      [72.8797, 19.0760],
      [72.8797, 19.0780],
      [72.8777, 19.0780],
      [72.8777, 19.0760],
    ],
    type: [[Number]],
  })
  @ValidateIf(o => o.type === 'polygon')
  @IsArray()
  coordinates?: number[][];
}
