import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, salonId: string, dto: CreateTeamMemberDto) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    if (user.role !== 'ADMIN' && salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to add team members to this salon.');
    }

    return this.prisma.teamMember.create({
      data: {
        salonId,
        name: dto.name,
        role: dto.role,
        bio: dto.bio,
        image: dto.image,
        specialties: dto.specialties || [],
        experience: dto.experience,
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  async findBySalon(salonId: string, includeInactive = false) {
    const where: any = { salonId };
    if (!includeInactive) {
      where.isActive = true;
    }
    return this.prisma.teamMember.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
    });
    if (!member) {
      throw new NotFoundException('Team member not found.');
    }
    return member;
  }

  async update(user: any, id: string, dto: UpdateTeamMemberDto) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
      include: { salon: true },
    });
    if (!member) {
      throw new NotFoundException('Team member not found.');
    }
    if (user.role !== 'ADMIN' && member.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to update this team member.');
    }

    return this.prisma.teamMember.update({
      where: { id },
      data: dto,
    });
  }

  async remove(user: any, id: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id },
      include: { salon: true },
    });
    if (!member) {
      throw new NotFoundException('Team member not found.');
    }
    if (user.role !== 'ADMIN' && member.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to delete this team member.');
    }

    await this.prisma.teamMember.delete({ where: { id } });
    return { message: 'Team member deleted successfully.' };
  }
}
