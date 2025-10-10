// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SalonsModule } from './salons/salons.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LikesModule } from './likes/likes.module';
import { GalleryModule } from './gallery/gallery.module';
import { ChatModule } from './chat/chat.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';
import { LocationsModule } from './locations/locations.module';
import { CategoriesModule } from './categories/categories.module'; // Import the new module
import { ProductOrdersModule } from './product-orders/product-orders.module';
import { SellersModule } from './sellers/sellers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SalonsModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
    ReviewsModule,
    AdminModule,
    FavoritesModule,
    LikesModule,
    GalleryModule,
    ChatModule,
    EventsModule,
    NotificationsModule,
    CloudinaryModule,
    ProductsModule,
    PromotionsModule,
    LocationsModule,
    CategoriesModule, // Add the new module here
    ProductOrdersModule,
    SellersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
