import 'dotenv/config';
import { buildApp } from './app';

const start = async () => {
  try {
    const app = await buildApp();
    const port = Number(process.env.PORT) || 3001;
    
    await app.listen({ port, host: '0.0.0.0' });
    
    const { networkInterfaces } = await import('os');
    const nets = networkInterfaces();
    console.log(`🚀 Backend running at:`);
    console.log(`   - Local:   http://localhost:${port}`);
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]!) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`   - Network: http://${net.address}:${port}`);
        }
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
