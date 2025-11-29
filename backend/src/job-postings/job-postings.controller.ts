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
import { JobPostingsService } from './job-postings.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

@Controller('api/jobs')
export class JobPostingsController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  // Get all active job postings (Public)
  @Get()
  findAll(@Query('jobType') jobType?: string) {
    return this.jobPostingsService.findAll({ jobType });
  }

  // Get all job postings for a salon (Public)
  @Get('salon/:salonId')
  findBySalon(
    @Param('salonId') salonId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.jobPostingsService.findBySalon(salonId, includeInactive === 'true');
  }

  // Get a single job posting (Public)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobPostingsService.findOne(id);
  }

  // Create a job posting (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Post('salon/:salonId')
  create(
    @GetUser() user: any,
    @Param('salonId') salonId: string,
    @Body() dto: CreateJobPostingDto,
  ) {
    return this.jobPostingsService.create(user, salonId, dto);
  }

  // Update a job posting (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateJobPostingDto,
  ) {
    return this.jobPostingsService.update(user, id, dto);
  }

  // Delete a job posting (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.jobPostingsService.remove(user, id);
  }

  // Apply to a job (Public or Authenticated)
  @Post(':id/apply')
  apply(
    @Param('id') id: string,
    @Body() dto: CreateJobApplicationDto,
  ) {
    return this.jobPostingsService.applyToJob(id, dto);
  }

  // Get applications for a job (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/applications')
  getApplications(@GetUser() user: any, @Param('id') id: string) {
    return this.jobPostingsService.getApplications(user, id);
  }

  // Update application status (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Patch('applications/:applicationId/status')
  updateApplicationStatus(
    @GetUser() user: any,
    @Param('applicationId') applicationId: string,
    @Body('status') status: string,
  ) {
    return this.jobPostingsService.updateApplicationStatus(user, applicationId, status);
  }
}
