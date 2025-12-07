import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTop10RequestDto } from './dto/create-top10-request.dto';
import { Resend } from 'resend';

@Injectable()
export class Top10RequestsService {
  private readonly logger = new Logger(Top10RequestsService.name);
  private resend: Resend | null;
  private fromEmail: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = this.config.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';
  }

  async createRequest(dto: CreateTop10RequestDto) {
    this.logger.log(`New Top 10 request received for category: ${dto.category}`);

    // Store the request in database
    const request = await this.prisma.top10Request.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        category: dto.category,
        serviceNeeded: dto.serviceNeeded,
        styleOrLook: dto.styleOrLook,
        budget: dto.budget,
        serviceType: dto.serviceType,
        location: dto.location,
        latitude: dto.locationCoords?.lat,
        longitude: dto.locationCoords?.lng,
        preferredDate: new Date(dto.preferredDate),
        preferredTime: dto.preferredTime,
        status: 'PENDING',
      },
    });

    // Send email notification to admin
    try {
      await this.sendAdminNotification(dto);
    } catch (error) {
      this.logger.error('Failed to send admin notification email', error);
    }

    return request;
  }

  private async sendAdminNotification(dto: CreateTop10RequestDto) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@stylrsa.co.za';
    
    if (!this.resend) {
      this.logger.log(`[DEV] Top 10 request notification for admin: ${dto.category} - ${dto.fullName}`);
      return;
    }
    
    const subject = `🔔 New Top 10 Request: ${dto.category}`;
    
    const html = `
      <h2>New Top 10 Service Provider Request</h2>
      
      <h3>📋 Category: ${dto.category}</h3>
      
      <h4>Contact Details</h4>
      <ul>
        <li><strong>Name:</strong> ${dto.fullName}</li>
        <li><strong>Phone:</strong> ${dto.phone}</li>
        ${dto.whatsapp ? `<li><strong>WhatsApp:</strong> ${dto.whatsapp}</li>` : ''}
        ${dto.email ? `<li><strong>Email:</strong> ${dto.email}</li>` : ''}
      </ul>
      
      <h4>Service Details</h4>
      <ul>
        <li><strong>Service Needed:</strong> ${dto.serviceNeeded}</li>
        ${dto.styleOrLook ? `<li><strong>Style/Look:</strong> ${dto.styleOrLook}</li>` : ''}
        <li><strong>Budget:</strong> R${dto.budget}</li>
        <li><strong>Service Type:</strong> ${dto.serviceType === 'onsite' ? 'Mobile (come to client)' : 'Visit Salon'}</li>
      </ul>
      
      <h4>Location & Time</h4>
      <ul>
        <li><strong>Location:</strong> ${dto.location}</li>
        ${dto.locationCoords ? `<li><strong>Coordinates:</strong> ${dto.locationCoords.lat}, ${dto.locationCoords.lng}</li>` : ''}
        <li><strong>Preferred Date:</strong> ${dto.preferredDate}</li>
        ${dto.preferredTime ? `<li><strong>Preferred Time:</strong> ${dto.preferredTime}</li>` : ''}
      </ul>
      
      <p><em>Please match this client with the top 10 providers in their area.</em></p>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: adminEmail,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error('Failed to send admin email:', error);
    }
  }

  async getAllRequests(status?: string) {
    return this.prisma.top10Request.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequestStatus(id: string, status: string) {
    return this.prisma.top10Request.update({
      where: { id },
      data: { status },
    });
  }
}
