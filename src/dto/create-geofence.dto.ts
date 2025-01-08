import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';

export class CreateGeofenceDto {
  @ApiProperty({
    description: 'The name of the geofence.',
    example: 'Warehouse Zone A',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The vehicle ID associated with the geofence.',
    example: 'veh1234',
  })
  @IsNotEmpty()
  vehicalId: string;

  @ApiProperty({
    description: 'The type of the geofence (Polygon or Circle).',
    example: 'Polygon',
  })
  @IsEnum(['Circle', 'Polygon'])
  type: 'Circle' | 'Polygon';

  @ApiProperty({
    description:
      'The geofence polygon coordinates (compulsory if type is Polygon). Each inner array represents a coordinate [longitude, latitude]. The first and last coordinates must be the same to close the polygon.',
    example: [
      [
        [70.7719452392734, 22.665616718129655],
        [70.69363829514157, 22.544769192251053],
        [70.80692024002343, 22.446521402345965],
        [71.01488547164377, 22.558769441147476],
        [70.7719452392734, 22.665616718129655],
      ],
    ],
    isArray: true,
  })
  @ValidateIf((o) => o.type === 'Polygon')
  @IsArray()
  @IsNotEmpty()
  geofencePolygon?: number[][][];

  @ApiProperty({
    description:
      'The center point of the geofence (compulsory if type is Circle). Represented as [longitude, latitude].',
    example: [70.255, 22.255],
  })
  @ValidateIf((o) => o.type === 'Circle')
  @IsArray()
  @IsNotEmpty()
  centerpoint?: [number, number];

  @ApiProperty({
    description: 'The radius of the geofence in kilometers (compulsory if type is Circle).',
    example: 0.5,
  })
  @ValidateIf((o) => o.type === 'Circle')
  @IsNumber()
  @IsNotEmpty()
  radius?: number;
}
