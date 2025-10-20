import { SetMetadata } from '@nestjs/common';

export const NO_CSRF_KEY = 'no_csrf';
export const NoCsrf = () => SetMetadata(NO_CSRF_KEY, true);
