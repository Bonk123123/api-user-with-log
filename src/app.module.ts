import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db.module';
import { UserModule } from './user/user.module';
import { UserEventLogModule } from './user.event.log/user.event.log.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UserModule,
    UserEventLogModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
