import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckGeofenceDto {
  @ApiProperty({ example: 40.75 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -73.98 })
  @IsNumber()
  longitude: number;
}
