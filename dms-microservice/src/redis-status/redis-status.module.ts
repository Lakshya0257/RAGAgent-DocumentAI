import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { RedisService } from './redis-status.service';

@Module({
    imports: [UserModule],
    providers: [RedisService]

})
export class RedisStatusModule {}
