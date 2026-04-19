import 'dotenv/config';
import { buildApp } from './app';

const start = async () => {
  try {
    const app = await buildApp();
    const port = Number(process.env.PORT) || 3001;
    
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Backend running at http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
