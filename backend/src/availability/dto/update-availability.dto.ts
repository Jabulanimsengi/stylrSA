// backend/src/availability/dto/update-availability.dto.ts
import { IsDateString, IsArray, ValidateNested, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class HourSlotDto {
  @IsInt()
  @Min(0)
  @Max(23)
  hour: number;

  @IsBoolean()
  isAvailable: boolean;
}

export class UpdateAvailabilityDto {
  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HourSlotDto)
  hours: HourSlotDto[];
}

