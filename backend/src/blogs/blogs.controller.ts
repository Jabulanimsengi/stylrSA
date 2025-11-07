import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';

@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  // Public endpoint - get published blogs
  @Get()
  findAll(@Query('published') published?: string) {
    const publishedOnly = published === 'true';
    return this.blogsService.findAll(publishedOnly);
  }

  // Public endpoint - get blog by slug
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }

  // Admin/Auth endpoints
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@GetUser() user: any, @Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(user, createBlogDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/all')
  findAllForAdmin() {
    return this.blogsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogsService.update(id, user, updateBlogDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/publish')
  publish(@Param('id') id: string, @GetUser() user: any) {
    return this.blogsService.publish(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string, @GetUser() user: any) {
    return this.blogsService.unpublish(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.blogsService.remove(id, user);
  }
}




