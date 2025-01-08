import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateGeofenceDto } from '../dto/create-geofence.dto';
import { UpdateGeofenceDto } from '../dto/update-geofence.dto';
import { Geofence } from '../schemas/geofence.schema';
import { GeofenceService } from '../services/geofence.service';
import { CheckPointDto } from 'src/dto/check-point.dto';

@ApiTags('geofences')
@Controller('geofences')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) { }

  @Post('check')
  async checkPoint(@Body() checkPointDto: CheckPointDto): Promise<Geofence[]> {
    return this.geofenceService.checkPoint(checkPointDto.vehicleId, [checkPointDto.longitude, checkPointDto.latitude]);
  }

  @Post()
  async create(@Body() createGeofenceDto: CreateGeofenceDto): Promise<Geofence> {
    return this.geofenceService.create(createGeofenceDto);
  }

  @Get()
  async findAll(): Promise<Geofence[]> {
    return this.geofenceService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Geofence> {
    return this.geofenceService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGeofenceDto: UpdateGeofenceDto,
  ): Promise<Geofence> {
    return this.geofenceService.update(id, updateGeofenceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.geofenceService.remove(id);
  }


}
