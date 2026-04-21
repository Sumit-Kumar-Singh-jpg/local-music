import { buildApp } from './src/app';

async function check() {
  const app = await buildApp();
  await app.ready();
  console.log('--- REGISTERED ROUTES ---');
  console.log(app.printRoutes());
  process.exit(0);
}

check();
