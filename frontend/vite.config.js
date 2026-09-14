import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Vite's dev server rejects requests with an unrecognized Host header
    // by default (anti DNS-rebinding protection). That breaks access
    // through an ngrok tunnel, whose hostname is neither "localhost" nor
    // your machine's IP. Safe to leave on for this kind of temporary,
    // dev-only sharing; don't rely on this for anything production-facing.
    allowedHosts: true,
  },
})
