import { defineConfig } from 'drizzle-kit';

export default defineConfig({
<<<<<<< HEAD
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
=======
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
>>>>>>> dfcb4fbd792a5249993b83370178a0194cc042db
});
