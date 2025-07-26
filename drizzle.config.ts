import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// 1. Получаем ШАБЛОН строки подключения
let connectionStringTemplate = process.env.DATABASE_URL;

// 2. Получаем пароль из отдельной переменной
const dbPassword = process.env.DB_PASSWORD;

// 3. Проверяем, что все переменные на месте
if (!connectionStringTemplate || !dbPassword) {
  throw new Error("DATABASE_URL и DB_PASSWORD должны быть установлены в .env файле!");
}

// 4. Подставляем пароль в шаблон
const connectionString = connectionStringTemplate.replace(
  '[YOUR-PASSWORD]', 
  encodeURIComponent(dbPassword)
);

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});