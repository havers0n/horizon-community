-- Добавление таблицы filled_reports
CREATE TABLE IF NOT EXISTS "public"."filled_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- Добавление первичного ключа
ALTER TABLE "public"."filled_reports" ADD CONSTRAINT "filled_reports_pkey" PRIMARY KEY ("id");

-- Добавление внешних ключей
ALTER TABLE "public"."filled_reports" ADD CONSTRAINT "filled_reports_template_id_fkey" 
    FOREIGN KEY ("template_id") REFERENCES "mdt"."report_templates"("id") ON DELETE CASCADE;

ALTER TABLE "public"."filled_reports" ADD CONSTRAINT "filled_reports_author_id_fkey" 
    FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Добавление индексов
CREATE INDEX "filled_reports_template_id_idx" ON "public"."filled_reports" ("template_id");
CREATE INDEX "filled_reports_author_id_idx" ON "public"."filled_reports" ("author_id");
CREATE INDEX "filled_reports_created_at_idx" ON "public"."filled_reports" ("created_at");

-- Добавление триггера для обновления updated_at
CREATE OR REPLACE TRIGGER "on_updated_at_filled_reports" 
    BEFORE UPDATE ON "public"."filled_reports" 
    FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();

-- Предоставление прав доступа
GRANT ALL ON TABLE "public"."filled_reports" TO "anon";
GRANT ALL ON TABLE "public"."filled_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."filled_reports" TO "service_role";

-- Добавление RLS политик
ALTER TABLE "public"."filled_reports" ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: пользователи могут читать свои заполненные отчеты
CREATE POLICY "Users can view their own filled reports" ON "public"."filled_reports"
    FOR SELECT USING ("author_id" = "auth"."uid"());

-- Политика для создания: пользователи могут создавать заполненные отчеты
CREATE POLICY "Users can create filled reports" ON "public"."filled_reports"
    FOR INSERT WITH CHECK ("author_id" = "auth"."uid"());

-- Политика для обновления: пользователи могут обновлять свои заполненные отчеты
CREATE POLICY "Users can update their own filled reports" ON "public"."filled_reports"
    FOR UPDATE USING ("author_id" = "auth"."uid"());

-- Политика для удаления: пользователи могут удалять свои заполненные отчеты
CREATE POLICY "Users can delete their own filled reports" ON "public"."filled_reports"
    FOR DELETE USING ("author_id" = "auth"."uid"()); 