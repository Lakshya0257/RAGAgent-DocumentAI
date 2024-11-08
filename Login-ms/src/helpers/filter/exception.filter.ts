import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
        status = exception.getStatus();
        const responseObject = exception.getResponse();
    if (typeof responseObject === 'string') {
      message = responseObject;
    } else if (typeof responseObject === 'object' && responseObject.hasOwnProperty('message')) {
      message = responseObject['message'];
    }else{
        message = exception.message;
    }
    }

    response
      .status(status)
      .json({
        status: 'error',
        data: {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: message,
        },
      });
  }
}