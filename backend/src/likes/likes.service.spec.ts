import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('LikesService', () => {
  let service: LikesService;
  let prismaService: { serviceLike: any; service: any };

  beforeEach(async () => {
    prismaService = {
      serviceLike: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
      },
      service: {
        update: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
