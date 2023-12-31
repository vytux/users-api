/**
 * Api error types
 */

export class RequestError extends Error {
  public constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export const UnauthorizedError = (message = 'Unauthorized') =>
  new RequestError(401, message);

export const NotFoundError = (message: string) =>
  new RequestError(404, message);

export const InvalidTokenError = (message = 'Invalid token') =>
  new RequestError(400, message);
