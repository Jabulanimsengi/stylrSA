import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

@Injectable()
export class JobPostingsService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, salonId: string, dto: CreateJobPostingDto) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    if (user.role !== 'ADMIN' && salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to create job postings for this salon.');
    }

    return this.prisma.jobPosting.create({
      data: {
        salonId,
        title: dto.title,
        description: dto.description,
        jobType: dto.jobType,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryPeriod: dto.salaryPeriod,
        requirements: dto.requirements || [],
        benefits: dto.benefits || [],
        experienceLevel: dto.experienceLevel,
        isRemote: dto.isRemote || false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async findAll(filters?: { jobType?: string; isActive?: boolean }) {
    const where: any = { isActive: true };
    if (filters?.jobType) {
      where.jobType = filters.jobType;
    }
    // Filter out expired jobs
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];

    return this.prisma.jobPosting.findMany({
      where,
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            province: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySalon(salonId: string, includeInactive = false) {
    const where: any = { salonId };
    if (!includeInactive) {
      where.isActive = true;
    }
    return this.prisma.jobPosting.findMany({
      where,
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            province: true,
            contactEmail: true,
          },
        },
      },
    });
    if (!job) {
      throw new NotFoundException('Job posting not found.');
    }
    return job;
  }

  async update(user: any, id: string, dto: UpdateJobPostingDto) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: { salon: true },
    });
    if (!job) {
      throw new NotFoundException('Job posting not found.');
    }
    if (user.role !== 'ADMIN' && job.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to update this job posting.');
    }

    const data: any = { ...dto };
    if (dto.expiresAt) {
      data.expiresAt = new Date(dto.expiresAt);
    }

    return this.prisma.jobPosting.update({
      where: { id },
      data,
    });
  }

  async remove(user: any, id: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: { salon: true },
    });
    if (!job) {
      throw new NotFoundException('Job posting not found.');
    }
    if (user.role !== 'ADMIN' && job.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to delete this job posting.');
    }

    await this.prisma.jobPosting.delete({ where: { id } });
    return { message: 'Job posting deleted successfully.' };
  }

  // Job Applications
  async applyToJob(jobId: string, dto: CreateJobApplicationDto, candidateId?: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException('Job posting not found.');
    }
    if (!job.isActive) {
      throw new ForbiddenException('This job posting is no longer accepting applications.');
    }

    return this.prisma.jobApplication.create({
      data: {
        jobId,
        candidateId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        coverLetter: dto.coverLetter,
        resumeUrl: dto.resumeUrl,
      },
    });
  }

  async getApplications(user: any, jobId: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { salon: true },
    });
    if (!job) {
      throw new NotFoundException('Job posting not found.');
    }
    if (user.role !== 'ADMIN' && job.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to view applications for this job.');
    }

    return this.prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplicationStatus(user: any, applicationId: string, status: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: { include: { salon: true } } },
    });
    if (!application) {
      throw new NotFoundException('Application not found.');
    }
    if (user.role !== 'ADMIN' && application.job.salon.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to update this application.');
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: status as any },
    });
  }
}
