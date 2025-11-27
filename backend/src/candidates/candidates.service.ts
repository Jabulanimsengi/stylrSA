import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidateProfession } from '@prisma/client';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CandidatesService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) { }

    async create(userId: string, createCandidateDto: CreateCandidateDto) {
        // Check if user already has a candidate profile
        const existingProfile = await this.prisma.candidate.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            throw new ForbiddenException('User already has a candidate profile');
        }

        // Update user role to CANDIDATE if not already (optional, depending on business logic)
        // For now, we just create the profile linked to the user

        return this.prisma.candidate.create({
            data: {
                userId,
                ...createCandidateDto,
            },
        });
    }

    async findAll(query: any) {
        const { province, city, profession, search } = query;

        const where: any = {};

        if (province) where.province = province;
        if (city) where.city = city;
        if (profession) where.profession = profession as CandidateProfession;

        // Basic search implementation
        if (search) {
            // Note: Prisma doesn't support full-text search on all DBs easily without extensions
            // We'll do a basic contains check on city or specializations
            // For JSON fields, it's trickier, so we keep it simple for now
        }

        const candidates = await this.prisma.candidate.findMany({
            where,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true, // We fetch it but will filter it out based on privacy settings
                        email: true,
                        phoneNumber: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        // Apply privacy filtering
        return candidates.map(candidate => {
            const privacyFilteredUser = { ...candidate.user };

            if (!candidate.showLastName) {
                // Show only first initial of last name
                privacyFilteredUser.lastName = candidate.user.lastName ? `${candidate.user.lastName.charAt(0)}.` : '';
            }

            if (!candidate.showEmail) {
                delete privacyFilteredUser.email;
            }

            if (!candidate.showPhone) {
                delete privacyFilteredUser.phoneNumber;
            }

            return {
                ...candidate,
                user: privacyFilteredUser,
            };
        });
    }

    async findOne(id: string) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    }
                }
            }
        });

        if (!candidate) {
            throw new NotFoundException(`Candidate with ID ${id} not found`);
        }

        // Apply privacy filtering
        const privacyFilteredUser = { ...candidate.user };

        if (!candidate.showLastName) {
            privacyFilteredUser.lastName = candidate.user.lastName ? `${candidate.user.lastName.charAt(0)}.` : '';
        }

        if (!candidate.showEmail) {
            delete privacyFilteredUser.email;
        }

        if (!candidate.showPhone) {
            delete privacyFilteredUser.phoneNumber;
        }

        return {
            ...candidate,
            user: privacyFilteredUser,
        };
    }

    async update(id: string, userId: string, updateCandidateDto: UpdateCandidateDto) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
        });

        if (!candidate) {
            throw new NotFoundException(`Candidate with ID ${id} not found`);
        }

        if (candidate.userId !== userId) {
            throw new ForbiddenException('You can only update your own profile');
        }

        return this.prisma.candidate.update({
            where: { id },
            data: updateCandidateDto,
        });
    }

    async uploadCv(userId: string, file: Express.Multer.File) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { userId },
        });

        if (!candidate) {
            throw new NotFoundException('Candidate profile not found');
        }

        const result = await this.cloudinary.uploadFile(file, 'candidate-cvs');

        return this.prisma.candidate.update({
            where: { id: candidate.id },
            data: {
                cvUrl: result.secure_url,
            },
        });
    }

    async findAllAdmin(query: any) {
        const { province, city, profession, search } = query;
        const where: any = {};

        if (province) where.province = province;
        if (city) where.city = city;
        if (profession) where.profession = profession as CandidateProfession;

        return this.prisma.candidate.findMany({
            where,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
    }

    async remove(id: string, userId: string) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
        });

        if (!candidate) {
            throw new NotFoundException(`Candidate with ID ${id} not found`);
        }

        if (candidate.userId !== userId) {
            throw new ForbiddenException('You can only delete your own profile');
        }

        return this.prisma.candidate.delete({
            where: { id },
        });
    }
}
