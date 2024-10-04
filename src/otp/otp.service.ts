// otp.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './schemas/otp.schema';
import { awsConfig } from 'src/config/aws.config';

@Injectable()
export class OtpService {
  private sesClient: SESClient;
  private snsClient: SNSClient;
  private otpStore: Record<string, string> = {};

  constructor(
    private configService: ConfigService,
    @InjectModel('Otp') private readonly otpModel: Model<Otp>,
  ) {
    const { region, accessKeyId, secretAccessKey, sourceEmail } = awsConfig(
      this.configService,
    );

    if (!sourceEmail) {
      throw new Error('Source email is not defined in environment variables.');
    }

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS configuration is missing.');
    }

    this.sesClient = new SESClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.snsClient = new SNSClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
    const emailTemplate = `
      <html>
        <body>
          <h2>Your OTP Code</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) is <strong>${otp}</strong>.</p>
          <p>This OTP is valid for the next 10 minutes. Please use it to verify your account.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
          <br/>
          <p>Regards,<br/>ClassEnto</p>
        </body>
      </html>
    `;

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: {
            Data: emailTemplate,
          },
          Text: {
            Data: `Your OTP is ${otp}. This OTP is valid for 10 minutes.`,
          },
        },
        Subject: { Data: 'Your OTP Code' },
      },
      Source: this.configService.get('SOURCE_EMAIL'),
    });

    try {
      await this.sesClient.send(command);
      this.otpStore[toEmail] = otp;
    } catch (err) {
      console.error('Failed to send OTP email:', err);
      throw err;
    }
  }

  // async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
  //   const command = new SendEmailCommand({
  //     Destination: {
  //       ToAddresses: [toEmail],
  //     },
  //     Message: {
  //       Body: {
  //         Text: {
  //           Data: Your OTP is ${otp}.,
  //         },
  //       },
  //       Subject: { Data: 'Your OTP Code' },
  //     },
  //     Source: this.configService.get('SOURCE_EMAIL'),
  //   });

  //   try {
  //     await this.sesClient.send(command);
  //     this.otpStore[toEmail] = otp;
  //   } catch (err) {
  //     console.error('Failed to send OTP email:', err);
  //     throw err;
  //   }
  // }

  async sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
    const command = new PublishCommand({
      Message: `Your OTP code is ${otp}`,
      PhoneNumber: phoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'YourApp',
        },
      },
    });

    try {
      const result = await this.snsClient.send(command);
      this.otpStore[phoneNumber] = otp;

      console.log(`OTP sent successfully to ${phoneNumber}:`, result.MessageId);
    } catch (err: unknown) {
      const error = err as Error;

      console.error('Failed to send OTP SMS:', {
        errorMessage: error.message,
        stack: error.stack,
        code: (error as any).code,
      });
      throw error;
    }
  }

  async verifyOtp(identifier: string, otp: string): Promise<boolean> {
    const otpRecord = await this.otpModel.findOne({
      identifier,
      otp,
      isUsed: false,
    });

    if (!otpRecord) {
      return false;
    }

    const currentTime = new Date();
    if (otpRecord.expiresAt < currentTime) {
      return false;
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    return true;
  }

  async storeOtp(identifier: string, otp: string) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const otpDoc = new this.otpModel({
      identifier,
      otp,
      expiresAt,
      isUsed: false,
    });

    await otpDoc.save();
  }
  

  getExpirationTime(): number {
    return this.configService.get<number>('OTP_EXPIRATION_TIME') || 10;
  }
}
