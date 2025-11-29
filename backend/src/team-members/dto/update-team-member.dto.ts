import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamMemberDto } from './create-team-member.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
