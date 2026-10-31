import { ZodError } from 'zod';

export function notFoundHandler(_request, response) {
  response.status(404).json({ message: 'API route not found' });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Request validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error?.code === 11000) {
    return response.status(409).json({ message: 'An account with this email already exists' });
  }

  if (error?.name === 'CastError') {
    return response.status(400).json({ message: 'Invalid identifier' });
  }

  const status = Number.isInteger(error?.status) ? error.status : 500;
  if (status >= 500) {
    console.error(error);
  }

  return response.status(status).json({
    message: status >= 500 ? 'An unexpected server error occurred' : error.message,
  });
}
