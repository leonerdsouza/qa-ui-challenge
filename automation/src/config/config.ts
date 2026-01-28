import path from 'path';

const projectRoot = path.resolve(__dirname, '..', '..', '..'); 

export const config = {
  ui: {
    baseUrl: process.env.UI_BASE_URL || 'http://localhost:5500/ui',
    timeout: 10000,
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 5000,
  },
  db: {
   path: process.env.DB_PATH || path.join(projectRoot, 'db', 'seed.db'),

  },
  testUsers: {
    admin: {
      id: parseInt(process.env.TEST_USER_ID || '1'),
      email: process.env.TEST_USER_EMAIL || 'admin@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
    },
  },
} as const;