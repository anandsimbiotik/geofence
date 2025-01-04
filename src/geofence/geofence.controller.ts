import { Controller, Post, Body, Get } from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { CheckGeofenceDto } from './dto/check-geofence.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('geofences')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a new geofence' })
  @ApiResponse({ status: 201, description: 'Geofence created successfully.' })
  create(@Body() createGeofenceDto: CreateGeofenceDto) {
    return this.geofenceService.create(createGeofenceDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all geofences' })
  @ApiResponse({ status: 200, description: 'List of geofences.' })
  getAll() {
    return this.geofenceService.getAllGeofences();
  }

  @Post('check')
  @ApiOperation({ summary: 'Check if a point is within any geofence' })
  @ApiResponse({ status: 200, description: 'List of geofence IDs containing the point.' })
  async checkGeofence(@Body() checkGeofenceDto: CheckGeofenceDto) {
    const { latitude, longitude } = checkGeofenceDto;
    return await this.geofenceService.getGeofenceIds(latitude, longitude);
  }
}
