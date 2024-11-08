import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const user_id = request.headers['x-user-id'];

    if (user_id) {
      request.body = { ...request.body, user_id };
    }
    return next.handle().pipe(
      map(data => ({
        status: 'success',
        data,
      })),
    );
  }
}