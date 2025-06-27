import config from "@/lib/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(config.env.databaseUrl);                            // Conexión a la base de datos

export const db = drizzle({ client: sql, casing: "snake_case" });    // Se inicializa el cliente de Drizzle con la conexión a la base de datos
