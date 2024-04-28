import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodFilter<T extends ZodError> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = 400;

    const errorMessages = exception.errors.map(
      (error) => `${error.path.join('.')} ${error.message}`,
    );

    response.status(status).json({
      errors: errorMessages,
      error: 'Bad Request',
      statusCode: status,
    });
  }
}
