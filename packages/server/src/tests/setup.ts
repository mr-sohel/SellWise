import { db } from '../config/db';

beforeAll(async () => {
  // Test connection or perform any setup
});

afterAll(async () => {
  // Close the connection pool so tests exit gracefully
  await db.end();
});