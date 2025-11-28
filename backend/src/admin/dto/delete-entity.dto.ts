import { IsOptional, IsString } from 'class-validator';

export class DeleteEntityDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
