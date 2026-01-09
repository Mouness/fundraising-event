import { defineConfig } from '@prisma/config';
import { expand } from 'dotenv-expand';
import { config } from 'dotenv';
import { join } from 'path';

expand(config({ path: join(__dirname, '../.env') }));

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // If running from api root, schema path in config is relative to execution or config? 
  // Prisma 7 is new. Usually schema is passed via CLI args if standard location isn't used.
  // We will pass --schema via CLI, so we might not need it here, or we set it to absolute/relative correctly.
});
