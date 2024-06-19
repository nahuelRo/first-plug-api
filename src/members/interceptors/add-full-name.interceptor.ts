import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AddFullNameInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (Array.isArray(data)) {
          return data.map(item => this.addFullName(item));
        }
        return this.addFullName(data);
      }),
    );
  }

  private addFullName(user: any) {
    if (user.toObject) {
      user = user.toObject();
    }

    if (user && user.firstName && user.lastName) {
      user.fullName = `${user.firstName} ${user.lastName}`;
    }
    
    return user;
  }
}
