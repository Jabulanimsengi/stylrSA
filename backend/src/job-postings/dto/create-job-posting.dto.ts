import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsEnum, IsDateString, Min } from 'class-validator';

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP',
}

export enum SalaryPeriod {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
}

export class CreateJobPostingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(JobType)
  jobType: JobType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsEnum(SalaryPeriod)
  salaryPeriod?: SalaryPeriod;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
