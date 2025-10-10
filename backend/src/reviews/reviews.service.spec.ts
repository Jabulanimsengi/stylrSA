import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: { booking: any; review: any };

  beforeEach(async () => {
    prismaService = {
      booking: {
        findUnique: jest.fn(),
      },
      review: {
        create: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
