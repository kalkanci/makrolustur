import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Fix for TS2580: Cannot find name 'process' in vite.config.ts
// We declare it manually here to avoid conflicts with adding @types/node to the whole project
declare const process: { 
  cwd: () => string; 
  env: Record<string, string | undefined>; 
};

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY is replaced with the string value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevents "process is not defined" error in the browser
      'process.env': {}, 
    },
    server: {
      host: true
    }
  };
});