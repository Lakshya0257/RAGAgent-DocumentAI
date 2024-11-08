import { Body, Controller, Post, UploadedFile, UseFilters, UseInterceptors } from "@nestjs/common";
import { FileService } from "./files.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CommonDto } from "src/helper/commonBody.dto";
import { HttpExceptionFilter } from "src/helper/filters/exception.filter";
import { TransformInterceptor } from "src/helper/intercepters/transform.interceptor";

@Controller('file')
@UseFilters(HttpExceptionFilter)
@UseInterceptors(TransformInterceptor)
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() commonDto: CommonDto) {
        const fileUrl = await this.fileService.uploadFile(file, commonDto);
        return { fileUrl };
    }
}