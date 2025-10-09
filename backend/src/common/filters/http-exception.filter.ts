import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

function codeFromStatus(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'VALIDATION_FAILED';
    case HttpStatus.UNAUTHORIZED:
      return 'AUTH_REQUIRED';
    case HttpStatus.FORBIDDEN:
      return 'PERMISSION_DENIED';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    case HttpStatus.PAYLOAD_TOO_LARGE:
      return 'PAYLOAD_TOO_LARGE';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE';
    case HttpStatus.BAD_GATEWAY:
      return 'BAD_GATEWAY';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'SERVICE_UNAVAILABLE';
    case HttpStatus.GATEWAY_TIMEOUT:
      return 'GATEWAY_TIMEOUT';
    default:
      return 'INTERNAL_ERROR';
  }
}

function friendlyFromCode(code: string): string {
  const map: Record<string, string> = {
    AUTH_REQUIRED: 'Please log in to continue.',
    PERMISSION_DENIED: "You don't have permission to do that.",
    NOT_FOUND: "We couldn't find what you were looking for.",
    VALIDATION_FAILED: 'Please check the form and try again.',
    CONFLICT: 'That action conflicted with an existing item.',
    RATE_LIMITED: 'Too many requests. Please try again in a moment.',
    PAYLOAD_TOO_LARGE: 'That upload is too large.',
    UNPROCESSABLE: 'We could not process that request.',
    BAD_GATEWAY: 'Temporary upstream issue. Please try again.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again.',
    GATEWAY_TIMEOUT: 'The request timed out. Please try again.',
    INTERNAL_ERROR: 'Something went wrong. Please try again.',
  };
  return map[code] || map.INTERNAL_ERROR;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let devMessage: string | string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      devMessage = (res && (res.message ?? res.error)) || exception.message;
    } else if (exception && typeof exception === 'object' && (exception as any).status) {
      status = Number((exception as any).status) || status;
      devMessage = (exception as any).message;
    }

    const code = codeFromStatus(status);
    const userMessage = friendlyFromCode(code);

    // When class-validator sends array of messages, take the first for dev message
    const devMsg = Array.isArray(devMessage) ? devMessage[0] : devMessage;

    response.status(status).json({
      statusCode: status,
      code,
      message: devMsg || 'Internal error',
      userMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
