import { Module } from '@nestjs/common';
import { JobPostingsService } from './job-postings.service';
import { JobPostingsController } from './job-postings.controller';

@Module({
  providers: [JobPostingsService],
  controllers: [JobPostingsController],
  exports: [JobPostingsService],
})
export class JobPostingsModule {}
