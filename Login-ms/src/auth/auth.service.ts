import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign_up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials } from './entity/credentials.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Credentials)
    private readonly credentialsRepository: Repository<Credentials>,
    private jwtService: JwtService,
    // private mailerService : MailerService
  ) {}

  /**
   * Creates a new user account.
   * @param signUpDto - The user's sign-up information.
   * @returns An object containing a success message and an access token if the sign-up is successful, or an error message if it fails.
   */
  async signup(signUpDto: SignUpDto) {
    try {
      const user = await this.credentialsRepository.findOne({
        where: { email: signUpDto.email },
      });
      if (user) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      const credentials = new Credentials();
      credentials.email = signUpDto.email;
      const hashPass = await bcrypt.hash(signUpDto.password, 10);
      credentials.password = hashPass;
      const confirmationToken = uuidv4();
      credentials.confirmationToken = confirmationToken.toString();
      // const payload = { email: signUpDto.email, password: signUpDto.password };
      // const token = await this.jwtService.signAsync(payload);
      // await this.sendVerificationEmail(signUpDto.email, confirmationToken);
      const val = await this.credentialsRepository.save(credentials);
      const payload = { email: signUpDto.email, userId: val._id };
      const token = await this.jwtService.signAsync(payload);
      return {
        user_id: val._id,
        accessToken: token,
      };
      // console.log(confirmationToken+" from regi");
      // return 'Registration successful. Please check your email for verification.';
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async sendVerificationEmail(email: string, token: string) {
  //   const url = `http://localhost:3000/auth/v1/confirm?token=${token}`;
  //   await this.mailerService.sendMail({
  //     to: email,
  //     subject: 'Email confirmation',
  //     html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
  //   });
  // }

  /**
   * Authenticates a user using their email and password.
   * @param signUpDto - The user's email and password.
   * @returns An access token if the authentication is successful, or an error message if it fails.
   */
  async login(signUpDto: SignUpDto) {
    try {
      const user = await this.credentialsRepository.findOne({
        where: { email: signUpDto.email },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }
      if (!(await bcrypt.compare(signUpDto.password, user.password))) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      // if(!user.isVerified){
      //   await this.sendVerificationEmail(user.email, user.confirmationToken);
      //   return 'Verification needed. Please check your email for verification.';
      // }
      const payload = { email: signUpDto.email, userId: user._id };
      const token = await this.jwtService.signAsync(payload);
      return {
        user_id: user._id,
        accessToken: token,
      };
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async confirmEmail(token: string): Promise<string> {
  //   try{
  //     const user = await this.credentialsRepository.findOne({ where: { confirmationToken: token } });
  //     if (!user) {
  //       throw new HttpException('Invalid confirmation token', HttpStatus.BAD_REQUEST);
  //     }
  //     user.isVerified = true;
  //     user.confirmationToken = null;
  //     await this.credentialsRepository.save(user);
  //     const payload = { email: user.email, userId: user._id };
  //     const jwtToken = await this.jwtService.signAsync(payload);
  //     return 'https://youtube.com'; // URL to redirect to after confirmation
  //   }catch(err){
  //     throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
