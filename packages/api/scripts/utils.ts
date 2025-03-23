/**
 * Validates a psql db URL
 * @param url The db URL to validate
 */
export function validateDatabaseUrl(url: string): void {
  try {
    const dbUrl = new URL(url);

    // check protocol
    if (dbUrl.protocol !== 'postgres:' && dbUrl.protocol !== 'postgresql:') {
      throw new Error(
        `Invalid protocol: ${dbUrl.protocol}. Expected 'postgres:' or 'postgresql:'`,
      );
    }

    // check if hostname exists
    if (!dbUrl.hostname) {
      throw new Error('Missing hostname in database URL');
    }

    // check for username/password if not using socket
    if (dbUrl.hostname !== 'localhost' && dbUrl.hostname !== '127.0.0.1') {
      if (!dbUrl.username) {
        throw new Error('Missing username in database URL');
      }

      if (!dbUrl.password) {
        throw new Error('Missing password in database URL');
      }
    }

    if (!dbUrl.pathname || dbUrl.pathname === '/') {
      throw new Error('Missing database name in database URL');
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      throw new Error('The database URL is not a valid URL format');
    }
    throw error;
  }
}
