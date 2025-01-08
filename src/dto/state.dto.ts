import { IsString, IsIn } from 'class-validator';

export class SetVehicleGeofenceStateDto {
  @IsString()
  vehicleId: string;

  @IsString()
  geofenceId: string;

  @IsString()
  name: string;

  @IsIn(['In', 'Out'])
  state: 'In' | 'Out';
}
