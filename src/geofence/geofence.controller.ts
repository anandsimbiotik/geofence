// import { Controller, Get, Post, Body } from '@nestjs/common';
// import { GeofenceService } from './geofence.service';
// import { CreateGeofenceDto } from './dto/create-geofence.dto';
// import { CheckPointDto } from './dto/check-point.dto';

// @Controller('geofence')
// export class GeofenceController {
//   constructor(private readonly geofenceService: GeofenceService) {}

//   @Post()
//   create(@Body() createGeofenceDto: CreateGeofenceDto) {
//     return this.geofenceService.create(createGeofenceDto);
//   }

//   @Get()
//   findAll() {
//     return this.geofenceService.findAll();
//   }

//   @Post('check')
//   checkPoint(@Body() checkPointDto: CheckPointDto) {
//     return this.geofenceService.checkPoint(checkPointDto);
//   }
// }



import { Controller, Get, Post, Body } from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { CheckPointDto } from './dto/check-point.dto';

@Controller('geofence')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) { }

  @Post()
  create(@Body() createGeofenceDto: CreateGeofenceDto) {
    return this.geofenceService.create(createGeofenceDto);
  }

  @Get()
  findAll() {
    return this.geofenceService.findAll();
  }

  @Post('check')
  checkPoint(@Body() checkPointDto: CheckPointDto) {
    return this.geofenceService.checkPoint(checkPointDto);
  }
}