import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStorage } from 'src/entity/userStorage.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RedisService implements OnModuleInit {
    private publisher;
    private subscriber;

    constructor(
        private readonly userService: UserService
    ) {
        const redisConfig = {
            password: 'pDCYrBDY8fyzQZAeHPwLVzCiPPPsM37l',
            socket: {
                host: 'redis-16280.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 16280
            }
        };

        this.publisher = createClient(redisConfig);
        this.subscriber = createClient(redisConfig);
    }

    async onModuleInit() {
        try {
            await this.publisher.connect();
            await this.subscriber.connect();

            console.log('Redis connections established successfully');

            await this.subscriber.subscribe('fileStatus', async (message) => {
                try {
                    const { fileId, status } = JSON.parse(message);
                    console.log('Received message from Redis:', fileId);
                    await this.userService.updateFileStatus(fileId, status);
                } catch (error) {
                    console.error('Error processing Redis message:', error);
                }
            });

        } catch (error) {
            console.error('Redis connection error:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.publisher.quit();
        await this.subscriber.quit();
    }
}