import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let prismaService: Partial<PrismaService>;
  let notificationsService: Partial<NotificationsService>;

  beforeEach(async () => {
    prismaService = {};
    notificationsService = {
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
