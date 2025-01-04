import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateGeofenceDto {
  @ApiProperty({
    example: 'zone1',
  })
  id: string;

  @ApiProperty({
    example: [
      [
        [-74.05, 40.8],
        [-74.04, 40.81],
        [-74.04, 40.82],
        [-74.05, 40.83],
        [-74.05, 40.8],
      ],
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  polygon: number[][][];
}
