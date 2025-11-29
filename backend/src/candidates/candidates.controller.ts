import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtGuard as JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/guard/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('api/candidates')
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Req() req, @Body() createCandidateDto: CreateCandidateDto) {
        return this.candidatesService.create(req.user.id, createCandidateDto);
    }

    @Post('upload-cv')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadCv(@Req() req, @UploadedFile() file: Express.Multer.File) {
        return this.candidatesService.uploadCv(req.user.id, file);
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAllAdmin(@Query() query: any) {
        return this.candidatesService.findAllAdmin(query);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.candidatesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.candidatesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Req() req, @Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto) {
        return this.candidatesService.update(id, req.user.id, updateCandidateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Req() req, @Param('id') id: string) {
        return this.candidatesService.remove(id, req.user.id);
    }
}
