import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'public-demo', 'public');
const out = path.join(root, 'dist');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(source, out, { recursive: true });

console.log('Prepared Vercel static output at dist/');
