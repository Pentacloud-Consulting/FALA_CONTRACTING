const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const outPath = path.join(__dirname, '..', 'src', 'lib', 'dbBackup.ts');

const buf = fs.readFileSync(dbPath);
const b64 = buf.toString('base64');
const content = `// Auto-generated SQLite seed database backup for serverless environments (Vercel)
export const DB_BASE64 = "${b64}";
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log(`Successfully generated ${outPath} (${b64.length} chars)`);
