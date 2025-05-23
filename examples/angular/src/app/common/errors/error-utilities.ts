import { HttpErrorResponse } from '@angular/common/http';
import { ZodError } from 'zod';
import { CloudError } from './cloud-error';

interface InnerError {
  code: string;
  message: string;
}

export function normalizeError(err: unknown): Error {
  if (err instanceof HttpErrorResponse) {
    const innerError = err?.error?.errors;
    if (isInnerErrorArray(innerError) && innerError.length > 0) {
      const newError = new CloudError(innerError[0].message, innerError[0].code);
      newError.stack = `HttpErrorResponse error: [${err.status}] ${err.message}\n url: ${err.url}}\n innerError: ${innerError[0].message}`;
      return newError;
    }
    const newError = new Error(err.message);
    newError.stack = `HttpErrorResponse error: [${err.status}] ${err.message}\n url: ${err.url}}`;
    return newError;
  }
  if (err instanceof ZodError) {
    const zodIssues = err.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
        return `Path: ${path}, Message: ${issue.message}`;
      })
      .join('\n');
    return new Error(zodIssues);
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error(typeof err === 'string' ? err : JSON.stringify(err, null, 2) || 'Unknown error');
}

function isInnerErrorArray(value: unknown): value is InnerError[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        'code' in item &&
        typeof item.code === 'string' &&
        'message' in item &&
        typeof item.message === 'string',
    )
  );
}
