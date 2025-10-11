import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

const isMongoConnectionString = (value?: string | null): boolean =>
  typeof value === 'string' && /mongodb(\+srv)?:\/\//i.test(value);

interface MongoHealth {
  ok: boolean;
  message: string;
  database?: string;
}

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient | null = null;
  private defaultDbName?: string;
  private readonly logger = new Logger(MongoService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const uri = this.resolveConnectionUri();
    if (!uri) {
      this.logger.log('MongoDB URI not configured; skipping connection.');
      return;
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.defaultDbName = this.client.db().databaseName ?? undefined;
      const dbLabel = this.defaultDbName ?? 'default database';
      this.logger.log(`Connected to MongoDB (${dbLabel}).`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`MongoDB connection failed: ${reason}`);
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.logger.log('MongoDB connection closed.');
    }
  }

  getDb(dbName?: string): Db {
    if (!this.client) {
      throw new Error('MongoDB client is not initialised.');
    }
    return this.client.db(dbName ?? this.defaultDbName);
  }

  async healthCheck(): Promise<MongoHealth> {
    if (!this.client) {
      return {
        ok: false,
        message:
          'MongoDB client is not initialised. Set MONGO_URI to enable the connection.',
      };
    }

    try {
      const db = this.getDb();
      await db.command({ ping: 1 });
      return {
        ok: true,
        message: 'MongoDB connection is healthy.',
        database: db.databaseName,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        message: `MongoDB ping failed: ${reason}`,
      };
    }
  }

  private resolveConnectionUri(): string | undefined {
    const explicit =
      this.configService.get<string>('MONGO_URI') ??
      this.configService.get<string>('MONGODB_URI');
    if (isMongoConnectionString(explicit)) {
      return explicit as string;
    }

    const fallback = this.configService.get<string>('DATABASE_URL');
    if (isMongoConnectionString(fallback)) {
      this.logger.warn(
        'Using DATABASE_URL for MongoDB connection. Consider moving this value to MONGO_URI to keep Prisma and Mongo configurations separate.',
      );
      return fallback;
    }

    return undefined;
  }
}
