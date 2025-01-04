import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckPointDto {
  @ApiProperty({
    example: 19.0760,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    example: 72.8777,
  })
  @IsNumber()
  longitude: number;
}
