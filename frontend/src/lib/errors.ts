import { toast } from 'react-toastify';

export type ApiError = {
  statusCode?: number;
  code?: string;
  message?: string;
  userMessage?: string;
};

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

export function toFriendlyMessage(err: unknown, fallback?: string): string {
  try {
    if (!err) return fallback || DEFAULT_MESSAGE;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || (fallback || DEFAULT_MESSAGE);
    const e = err as ApiError;
    if (e.userMessage) return e.userMessage;
    if (e.message) {
      // Hide technical details that look like stack traces
      if (/Error:|at\s+/.test(e.message)) return fallback || DEFAULT_MESSAGE;
      return e.message;
    }
    return fallback || DEFAULT_MESSAGE;
  } catch {
    return fallback || DEFAULT_MESSAGE;
  }
}

export function showError(err: unknown, fallback?: string) {
  const msg = toFriendlyMessage(err, fallback);
  toast.error(msg);
}

export async function parseErrorResponse(res: Response) {
  try {
    const data = await res.json();
    return (data && (data.userMessage || data.message))
      ? (data as ApiError)
      : ({ message: res.statusText } as ApiError);
  } catch {
    return { message: res.statusText } as ApiError;
  }
}
