import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoDbModule } from './common/mongo-db.module';

@Module({
  imports: [MongoDbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
