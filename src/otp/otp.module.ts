import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchema } from './schemas/otp.schema';
import { ConfigModule } from '@nestjs/config';  
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Otp', schema: OtpSchema }]),
    ConfigModule,  
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
