import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CheckPointDto {
  @ApiProperty({ description: 'Vehical id' })
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({ description: 'Longitude' })
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'Latitude' })
  @IsNotEmpty()
  latitude: number;
}
