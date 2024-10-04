import { IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class GenerateOtpDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  identifier: string;

  @IsIn(['email', 'sms'], { message: 'Invalid OTP type, must be email or sms' })
  type: 'email' | 'sms';
}
