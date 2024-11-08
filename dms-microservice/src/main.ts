import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // app.connectMicroservice<MicroserviceOptions>({
  //     transport: Transport.GRPC,
  //     options: {
  //       package: 'rag',
  //       protoPath: join(__dirname, './proto/rag.proto'),
  //       url: '0.0.0.0:8088'
  //   }});
    
  // await app.startAllMicroservices();
  // await app.listen(3000);
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 9000);
}
bootstrap();
