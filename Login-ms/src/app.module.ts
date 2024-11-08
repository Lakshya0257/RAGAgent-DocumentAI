import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as cors from 'cors';
import helmet from 'helmet';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [AuthModule,
  
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb+srv://lakshyabhati24:lakshyabhati24@cluster0.vw6zms8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      database: 'login-ms',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging:true,
      ssl:true
    }),
  //   MailerModule.forRoot({
  //     transport: {
  //       host: "sandbox.smtp.mailtrap.io",

  // port: 2525,

  // auth: {

  //   user: "9985b75e140ade",

  //   pass: "4ddbfbfde70d3b"

  // }
  //     },
  //     defaults: {
  //       from: '"No Reply" <noreply@example.com>',
  //     },
  //   }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Enable CORS with custom options
    const corsOptions = {
      origin: 'http://localhost:3001',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true, 
    };
    
    consumer.apply(cors(corsOptions)).forRoutes('*');
    consumer.apply(helmet()).forRoutes('*');
  }
}
