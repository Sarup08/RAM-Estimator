import { build } from 'vite';

async function main() {
  await build({
    configFile: 'vite.config.js',
    mode: 'production',
  });
  console.log('Build completed successfully');
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
