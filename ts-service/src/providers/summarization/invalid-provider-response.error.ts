export class InvalidProviderResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProviderResponseError';
  }
}
