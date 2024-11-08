import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credentials } from './entity/credentials.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/secret';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports:[
    TypeOrmModule.forFeature([Credentials]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10d' },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
