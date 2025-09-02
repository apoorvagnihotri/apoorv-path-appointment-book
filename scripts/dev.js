#!/usr/bin/env node
// Simple dev wrapper to support `npm run dev -- --debug` enabling VITE_DEBUG.
// Usage:
//   npm run dev          -> normal dev (no debug logs)
//   npm run dev -- --debug  -> enable debug logs

import { spawn } from 'node:child_process';

const hasDebug = process.argv.includes('--debug');
const env = { ...process.env };
if (hasDebug) {
  env.VITE_DEBUG = '1';
  // Also expose to Vite's import.meta.env via VITE_ prefix
}

const child = spawn('vite', { stdio: 'inherit', env, shell: true });
child.on('exit', (code) => process.exit(code ?? 0));
