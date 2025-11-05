import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateBlogDto) {
    // Check if slug already exists
    const existing = await this.prisma.blog.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ForbiddenException('A blog with this slug already exists');
    }

    const blog = await this.prisma.blog.create({
      data: {
        ...dto,
        content: dto.content as any, // Prisma will handle JSON
        authorId: user.id,
        publishedAt: dto.published ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return blog;
  }

  async findAll(published?: boolean) {
    const where: any = {};
    if (published !== undefined) {
      where.published = published;
    }

    return this.prisma.blog.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async update(id: string, user: any, dto: UpdateBlogDto) {
    const blog = await this.findOne(id);

    // Check if user is the author or admin
    if (blog.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own blogs');
    }

    // Check if slug is being changed and if it already exists
    if (dto.slug && dto.slug !== blog.slug) {
      const existing = await this.prisma.blog.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ForbiddenException('A blog with this slug already exists');
      }
    }

    const updateData: any = {
      ...dto,
    };

    if (dto.content) {
      updateData.content = dto.content as any;
    }

    // Set publishedAt when publishing for the first time
    if (dto.published === true && !blog.published) {
      updateData.publishedAt = new Date();
    }

    const updated = await this.prisma.blog.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, user: any) {
    const blog = await this.findOne(id);

    // Check if user is the author or admin
    if (blog.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    await this.prisma.blog.delete({
      where: { id },
    });

    return { message: 'Blog deleted successfully' };
  }

  async publish(id: string, user: any) {
    const blog = await this.findOne(id);

    if (blog.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only publish your own blogs');
    }

    const updated = await this.prisma.blog.update({
      where: { id },
      data: {
        published: true,
        publishedAt: blog.publishedAt || new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async unpublish(id: string, user: any) {
    const blog = await this.findOne(id);

    if (blog.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only unpublish your own blogs');
    }

    const updated = await this.prisma.blog.update({
      where: { id },
      data: {
        published: false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }
}


