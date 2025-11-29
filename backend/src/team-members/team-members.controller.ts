import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  Delete,
  Patch,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Controller('api/team-members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  // Get all team members for a salon (Public)
  @Get('salon/:salonId')
  findBySalon(
    @Param('salonId') salonId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.teamMembersService.findBySalon(salonId, includeInactive === 'true');
  }

  // Get a single team member (Public)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamMembersService.findOne(id);
  }

  // Add a team member to a salon (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Post('salon/:salonId')
  create(
    @GetUser() user: any,
    @Param('salonId') salonId: string,
    @Body() dto: CreateTeamMemberDto,
  ) {
    return this.teamMembersService.create(user, salonId, dto);
  }

  // Update a team member (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamMembersService.update(user, id, dto);
  }

  // Delete a team member (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.teamMembersService.remove(user, id);
  }
}
