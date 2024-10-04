import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send-email')
  async sendEmailOtp(@Body() generateOtpDto: GenerateOtpDto) {
    if (generateOtpDto.type !== 'email') {
      throw new BadRequestException('Invalid OTP type, must be email');
    }

    const { identifier } = generateOtpDto;
    const otp = this.otpService.generateOtp();
    
    await this.otpService.sendOtpEmail(identifier, otp);
    await this.otpService.storeOtp(identifier, otp);

    return { message: 'OTP sent via email' };
  }

  @Post('send-sms')
  async sendSmsOtp(@Body() generateOtpDto: GenerateOtpDto) {
    if (generateOtpDto.type !== 'sms') {
      throw new BadRequestException('Invalid OTP type, must be sms');
    }

    const { identifier } = generateOtpDto;
    const otp = this.otpService.generateOtp();

    await this.otpService.sendOtpSms(identifier, otp);
    await this.otpService.storeOtp(identifier, otp);

    return { message: 'OTP sent via SMS' };
  }

  @Post('verify')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { identifier, otp } = verifyOtpDto;

    const isValid = await this.otpService.verifyOtp(identifier, otp);

    if (isValid) {
      return { message: 'OTP is valid' };
    } else {
      throw new BadRequestException('Invalid or expired OTP');
    }
  }
}
