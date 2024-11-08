import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserStorage } from "src/entity/userStorage.entity";
import { CommonDto } from "src/helper/commonBody.dto";
import { FileService } from "src/files/files.service";
import { client } from "src/grpc/client";
import { waitUntil } from "@vercel/functions";

@Injectable()
export class UserService {
    constructor(@InjectRepository(UserStorage) private readonly userStorage: Repository<UserStorage>,@Inject(forwardRef(()=>FileService)) private readonly fileService: FileService ){}

    async storeFileData(userid: string, fileUrl: string, status: string, filename: string, filetype: string) {
        const file = new UserStorage({userId: userid, fileUrl: fileUrl, status: "pending", filename: filename, filetype: filetype})
        return await this.userStorage.save(file);
    }

    async getUserStorage(id: string) {
        return await this.userStorage.find({where: {userId: id}})
    }

    async deleteUserFile(userId: string, fileId: string) {
        const file = await this.userStorage.findOne({where: {id: fileId, userId: userId}});
        if(!file) throw new Error("File not found");
        await this.fileService.deleteFile(userId, file.fileUrl);
        await this.userStorage.remove(file);
        waitUntil(new Promise(()=>{
            client.DeleteDocument(
                { "file_id": fileId },
                (error: any, response: any) => {
                  if (error) {
                    console.log(error);
                  }
                  console.log(response);
                }
              );
        }))
        return "Delete successful";
    }

    async updateFileStatus(fileId: string, status: string) {
        const file = await this.userStorage.findOne({where: {id: fileId}});
        if(!file) throw new Error("File not found");
        file.status = status;
        await this.userStorage.save(file);
        return "Update successful";
    }
}