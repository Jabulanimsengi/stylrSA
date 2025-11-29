import { Module } from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import { TeamMembersController } from './team-members.controller';

@Module({
  providers: [TeamMembersService],
  controllers: [TeamMembersController],
  exports: [TeamMembersService],
})
export class TeamMembersModule {}
