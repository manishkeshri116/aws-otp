// aws.config.ts
import { ConfigService } from '@nestjs/config';

export const awsConfig = (configService: ConfigService) => ({
  region: configService.get<string>('AWS_REGION'),
  accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
  secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
  sourceEmail: configService.get<string>('SOURCE_EMAIL'),
});
