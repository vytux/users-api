
export class RequestError extends Error {
  public constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export const UnauthorizedError = (message = 'Unauthorized') =>
  new RequestError(500, message);

export const NotFoundError = (message: string) =>
  new RequestError(404, message);
