import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventsGateway } from 'src/events/events.gateway';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: Partial<PrismaService>;
  let notificationsService: Partial<NotificationsService>;
  let eventsGateway: Partial<EventsGateway>;

  beforeEach(async () => {
    prismaService = {};
    notificationsService = {};
    eventsGateway = {
      sendNotificationToUser: jest.fn(),
    } as Partial<EventsGateway>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
        {
          provide: EventsGateway,
          useValue: eventsGateway,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
