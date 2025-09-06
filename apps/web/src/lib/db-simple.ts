import postgres from "postgres";

// Simple database connection without Drizzle for testing
export const createConnection = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("Creating database connection with URL:", connectionString.substring(0, 20) + "...");

  return postgres(connectionString);
};

export const testConnection = async () => {
  try {
    const sql = createConnection();
    const result = await sql`SELECT 1 as test`;
    await sql.end();
    return { success: true, result };
  } catch (error) {
    console.error("Database connection test failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};
