import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStorage } from 'src/entity/userStorage.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FilesModule } from 'src/files/files.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserStorage]),forwardRef(()=>FilesModule)],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
