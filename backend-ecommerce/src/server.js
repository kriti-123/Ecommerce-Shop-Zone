import 'dotenv/config';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT || 3001);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.startsWith('replace-this')) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters in backend-ecommerce/.env');
}

try {
  await connectDatabase();
  const server = app.listen(port, () => {
    console.log(`ShopZone API listening on http://localhost:${port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => {
        process.exit(0);
      });
    });
  }
} catch (error) {
  console.error('Backend startup failed:', error.message);
  process.exitCode = 1;
}
