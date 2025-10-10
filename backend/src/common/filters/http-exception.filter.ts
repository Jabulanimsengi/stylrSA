import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

function codeFromStatus(status: number): string {
  const map: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'VALIDATION_FAILED',
    [HttpStatus.UNAUTHORIZED]: 'AUTH_REQUIRED',
    [HttpStatus.FORBIDDEN]: 'PERMISSION_DENIED',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.CONFLICT]: 'CONFLICT',
    [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
    [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE',
    [HttpStatus.BAD_GATEWAY]: 'BAD_GATEWAY',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    [HttpStatus.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT',
  };
  return map[status] ?? 'INTERNAL_ERROR';
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
    SERVICE_UNAVAILABLE:
      'Service is temporarily unavailable. Please try again.',
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
      const res = exception.getResponse() as unknown;
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if (typeof obj.message === 'string') devMessage = obj.message;
        else if (typeof obj.error === 'string') devMessage = obj.error;
        else devMessage = exception.message;
      } else {
        devMessage = exception.message;
      }
    } else if (exception && typeof exception === 'object') {
      const anyExc = exception as Record<string, unknown>;
      if ('status' in anyExc) {
        status = Number(anyExc.status) || status;
      }
      if ('message' in anyExc && typeof anyExc.message === 'string') {
        devMessage = anyExc.message;
      }
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
