import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnvironment } from './env.validation';
import * as path from 'path';

function getEnvFilePath(): string {
  const nodeEnv = process.env.NODE_ENV;
  const isLocal = process.env.IS_LOCAL;

  if (nodeEnv === 'test' && isLocal !== '1') {
    return path.join(process.cwd(), 'test.env');
  } else if (nodeEnv === 'test' && isLocal === '1') {
    return path.join(process.cwd(), 'test.local.env');
  }
  return path.join(process.cwd(), '.env');
}

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
      validate: validateEnvironment,
    }),
  ],
})
export class ConfigModule {}
