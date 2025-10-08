import { Injectable } from '@nestjs/common';
import { locationsData } from './locations.data';

@Injectable()
export class LocationsService {
  getLocations() {
    return locationsData;
  }
}
