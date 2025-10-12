import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';

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
    ALREADY_EXISTS: 'That information is already in use. Please try something else.',
    DATA_IN_USE:
      'This item is still linked to other information and cannot be removed yet.',
    INTERNAL_ERROR: 'Something went wrong. Please try again.',
  };
  return map[code] || map.INTERNAL_ERROR;
}

function looksTechnical(message?: string): boolean {
  if (!message) return false;
  const patterns = [
    /prisma/i,
    /sql/i,
    /invalid\s+`?prisma/i,
    /stack trace/i,
    /Error:/i,
    /at\s+\S+/,
    /forbidden resource/i,
    /unauthorized/i,
  ];
  return patterns.some((pattern) => pattern.test(message));
}

function mapPrismaError(error: PrismaClientKnownRequestError) {
  switch (error.code) {
    case 'P2002':
      return {
        status: HttpStatus.CONFLICT,
        code: 'ALREADY_EXISTS',
        userMessage:
          'That information is already in use. Please try something else.',
        devMessage: error.message,
      } as const;
    case 'P2003':
      return {
        status: HttpStatus.CONFLICT,
        code: 'DATA_IN_USE',
        userMessage:
          'This item is still linked to other information and cannot be removed yet.',
        devMessage: error.message,
      } as const;
    case 'P2025':
      return {
        status: HttpStatus.NOT_FOUND,
        code: 'NOT_FOUND',
        userMessage:
          'We could not find the requested item. It may have been removed.',
        devMessage: error.message,
      } as const;
    default:
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_FAILED',
        userMessage:
          'We could not process that information. Please check and try again.',
        devMessage: error.message,
      } as const;
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const referenceId = randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string | undefined;
    let userMessage: string | undefined;
    let devMessage: string | undefined;
    let allowDevMessageForUser = true;

    if (exception instanceof PrismaClientKnownRequestError) {
      const mapped = mapPrismaError(exception);
      status = mapped.status;
      code = mapped.code;
      userMessage = mapped.userMessage;
      devMessage = mapped.devMessage;
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_FAILED';
      userMessage =
        'We could not process that information. Please check and try again.';
      devMessage = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        devMessage = res;
      } else if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.message)) {
          devMessage = obj.message.map(String).join(', ');
          if (!userMessage) {
            userMessage = friendlyFromCode('VALIDATION_FAILED');
          }
          allowDevMessageForUser = false;
        } else if (typeof obj.message === 'string') {
          devMessage = obj.message;
        } else if (typeof obj.error === 'string') {
          devMessage = obj.error;
        }
        if (typeof obj.userMessage === 'string') {
          userMessage = obj.userMessage;
        }
        if (typeof obj.code === 'string') {
          code = obj.code;
        }
      } else {
        devMessage = exception.message;
      }
    } else if (exception && typeof exception === 'object') {
      const anyExc = exception as Record<string, unknown>;
      if ('status' in anyExc) {
        status = Number(anyExc.status) || status;
      }
      if (typeof anyExc.code === 'string') {
        code = String(anyExc.code);
      }
      if ('message' in anyExc && typeof anyExc.message === 'string') {
        devMessage = anyExc.message;
      }
    } else if (exception instanceof Error) {
      devMessage = exception.message;
    }

    if (!code) {
      code = codeFromStatus(status);
    }

    if (!userMessage) {
      userMessage = friendlyFromCode(code);
    }

    if (allowDevMessageForUser && devMessage && !looksTechnical(devMessage)) {
      userMessage = devMessage;
    }

    const safeMessage =
      devMessage && !looksTechnical(devMessage) ? devMessage : userMessage;

    const logMessage = `[${referenceId}] ${devMessage || safeMessage} (${request.method} ${request.url})`;
    if (status >= 500) {
      if (exception instanceof Error) {
        this.logger.error(logMessage, exception.stack);
      } else {
        this.logger.error(logMessage);
      }
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json({
      statusCode: status,
      code,
      message: safeMessage,
      userMessage,
      referenceId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
