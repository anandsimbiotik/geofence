import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsNotEmpty, ValidateIf } from 'class-validator';

export class UpdateGeofenceDto {
  @ApiProperty({ description: 'The name of the geofence' })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The vehical id of the geofence' })
  @IsOptional()
  vehicalId?: string;

  @ApiProperty({ description: 'The type of the geofence (Polygon / Circle)' })
  @IsEnum(['Circle', 'Polygon'])
  @IsOptional()
  type?: 'Circle' | 'Polygon';

  @ApiProperty({
    description: 'The geofence Polygon coordinates of the geofence (compulsory if type is Polygon)',
    example: [
      [
        [70.7719452392734, 22.665616718129655],
        [70.69363829514157, 22.544769192251053],
        [70.80692024002343, 22.446521402345965],
        [71.01488547164377, 22.558769441147476],
        [70.7719452392734, 22.665616718129655],
      ]
    ],
    isArray: true,
  })
  @ValidateIf((o) => o.type === 'Polygon')  // Validate geofencePolygon only if type is 'Polygon'
  @IsArray()
  @IsNotEmpty()
  geofencePolygon?: number[][][];  // For polygons only

  @ApiProperty({
    description: 'The center point of the geofence (compulsory if type is Circle)',
    example: [70.255, 22.255],
  })
  @ValidateIf((o) => o.type === 'Circle')  // Validate centerpoint only if type is 'Circle'
  @IsArray()
  @IsNotEmpty()
  centerpoint?: [number, number];  // For circles only

  @ApiProperty({
    description: 'The radius of the geofence (compulsory if type is Circle)',
    example: 0.5,
  })
  @ValidateIf((o) => o.type === 'Circle')  // Validate radius only if type is 'Circle'
  @IsNumber()
  @IsNotEmpty()
  radius?: number;  // For circles only
}