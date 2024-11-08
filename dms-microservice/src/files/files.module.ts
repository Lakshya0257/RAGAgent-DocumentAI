import { forwardRef, Module } from '@nestjs/common';
import { FileController } from './files.controller';
import { FileService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStorage } from 'src/entity/userStorage.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserStorage]), forwardRef(()=>UserModule)],
    controllers: [FileController],
    providers: [FileService],
    exports: [FileService]
})
export class FilesModule {}
