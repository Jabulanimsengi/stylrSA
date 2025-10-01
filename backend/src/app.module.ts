import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalonsModule } from './salons/salons.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { LocationsModule } from './locations/locations.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LikesModule } from './likes/likes.module';
import { ChatModule } from './chat/chat.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { GalleryModule } from './gallery/gallery.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SalonsModule,
    PrismaModule,
    AuthModule,
    ServicesModule,
    BookingsModule,
    ReviewsModule,
    AdminModule,
    LocationsModule,
    FavoritesModule,
    LikesModule,
    ChatModule,
    EventsModule,
    NotificationsModule,
    CloudinaryModule,
    GalleryModule,
    UsersModule,
    ProductsModule,
    PromotionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}