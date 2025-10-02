import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SalonsModule } from './salons/salons.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { LocationsModule } from './locations/locations.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LikesModule } from './likes/likes.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GalleryModule } from './gallery/gallery.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This is the crucial line to add
    }),
    AuthModule,
    PrismaModule,
    SalonsModule,
    ServicesModule,
    BookingsModule,
    ReviewsModule,
    AdminModule,
    LocationsModule,
    FavoritesModule,
    LikesModule,
    EventsModule,
    ChatModule,
    NotificationsModule,
    GalleryModule,
    CloudinaryModule,
    ProductsModule,
    PromotionsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}