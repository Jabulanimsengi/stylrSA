import { IsString, IsEnum, IsBoolean, IsArray, IsInt, IsOptional, IsJSON } from 'class-validator';
import { CandidateProfession } from '@prisma/client';

export class CreateCandidateDto {
    @IsEnum(CandidateProfession)
    profession: CandidateProfession;

    @IsString()
    province: string;

    @IsString()
    city: string;

    @IsBoolean()
    @IsOptional()
    willingToTravel?: boolean;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    preferredLocations?: string[];

    @IsInt()
    yearsExperience: number;

    @IsArray()
    @IsString({ each: true })
    qualifications: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    previousWorkplaces?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    portfolio?: string[];

    @IsArray()
    @IsString({ each: true })
    availableDays: string[];

    @IsString()
    @IsOptional()
    availableTimes?: string;

    @IsBoolean()
    @IsOptional()
    urgentBookings?: boolean;

    @IsBoolean()
    @IsOptional()
    weekendsHolidays?: boolean;

    @IsArray()
    @IsString({ each: true })
    specializations: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    techniques?: string[];

    @IsOptional()
    questionnaireAnswers: any;

    // Privacy settings
    @IsBoolean()
    @IsOptional()
    showFirstName?: boolean;

    @IsBoolean()
    @IsOptional()
    showLastName?: boolean;

    @IsBoolean()
    @IsOptional()
    showEmail?: boolean;

    @IsBoolean()
    @IsOptional()
    showPhone?: boolean;
}
