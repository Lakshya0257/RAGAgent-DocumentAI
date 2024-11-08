import { Controller, Delete, Get, Param, UseFilters, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { HttpExceptionFilter } from "src/helper/filters/exception.filter";
import { TransformInterceptor } from "src/helper/intercepters/transform.interceptor";

@Controller('user')
@UseFilters(HttpExceptionFilter)
@UseInterceptors(TransformInterceptor)
export class UserController {
    constructor(private readonly userService: UserService){}

    @Get(':id')
    findUser(@Param('id') id: string) {
        return this.userService.getUserStorage(id);
    }

    @Delete(':userId/:id')
    deleteFileDto(@Param('userId') userId: string,@Param('id') id: string) {
        return this.userService.deleteUserFile(userId, id);
    }
}