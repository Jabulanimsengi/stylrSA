import { PartialType } from '@nestjs/mapped-types';
import { CreateJobPostingDto } from './create-job-posting.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateJobPostingDto extends PartialType(CreateJobPostingDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
