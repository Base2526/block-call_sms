import { ApolloError } from 'apollo-server-errors';

export default class AppError extends ApolloError {
  constructor(code: string, message: string, description: Record<string, any> = {}) {
    super(message, code);

    // Add custom meta field to extensions
    this.extensions.description = description;

    // Define the `name` property dynamically
    Object.defineProperty(this, 'name', { value: 'AppError' });
  }
}
