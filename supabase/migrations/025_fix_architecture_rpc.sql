-- Миграция 025: Дополнительные RPC функции для исправления архитектуры
-- Замена прямых запросов к защищенным схемам на RPC функции

-- ===== ФУНКЦИИ ДЛЯ ТЕСТОВ =====

-- Получить все тесты
CREATE OR REPLACE FUNCTION public.get_all_tests()
RETURNS SETOF tests 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM tests ORDER BY id DESC;
END;
$$;

-- Получить тест по ID
CREATE OR REPLACE FUNCTION public.get_test_by_id(p_test_id UUID)
RETURNS SETOF tests 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM tests WHERE id = p_test_id;
END;
$$;

-- Получить результаты теста по ID теста
CREATE OR REPLACE FUNCTION public.get_test_results_by_test_id(p_test_id UUID)
RETURNS SETOF test_results 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM test_results WHERE test_id = p_test_id;
END;
$$;

-- Получить результаты теста пользователя
CREATE OR REPLACE FUNCTION public.get_user_test_results(p_user_id UUID, p_test_id UUID)
RETURNS SETOF test_results 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM test_results WHERE user_id = p_user_id AND test_id = p_test_id ORDER BY created_at DESC;
END;
$$;

-- Получить активную сессию теста
CREATE OR REPLACE FUNCTION public.get_active_test_session(p_user_id UUID, p_test_id UUID)
RETURNS SETOF test_sessions 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM test_sessions WHERE user_id = p_user_id AND test_id = p_test_id AND status = 'in_progress' LIMIT 1;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ ЗАПОЛНЕННЫХ РАПОРТОВ =====

-- Получить заполненный рапорт по ID
CREATE OR REPLACE FUNCTION public.get_filled_report_by_id(p_report_id UUID)
RETURNS SETOF filled_reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM filled_reports WHERE id = p_report_id;
END;
$$;

-- Получить заполненные рапорты пользователя
CREATE OR REPLACE FUNCTION public.get_user_filled_reports(p_user_id UUID)
RETURNS SETOF filled_reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM filled_reports WHERE author_id = p_user_id ORDER BY created_at DESC;
END;
$$;

-- Получить все заполненные рапорты (для админов)
CREATE OR REPLACE FUNCTION public.get_all_filled_reports()
RETURNS SETOF filled_reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM filled_reports ORDER BY created_at DESC;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ ШАБЛОНОВ РАПОРТОВ =====

-- Получить шаблон рапорта по ID
CREATE OR REPLACE FUNCTION public.get_report_template_by_id(p_template_id UUID)
RETURNS SETOF report_templates 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM report_templates WHERE id = p_template_id AND is_active = true;
END;
$$;

-- Получить все активные шаблоны рапортов
CREATE OR REPLACE FUNCTION public.get_active_report_templates()
RETURNS SETOF report_templates 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM report_templates WHERE is_active = true ORDER BY title;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ ПОДДЕРЖКИ =====

-- Получить тикет поддержки по ID
CREATE OR REPLACE FUNCTION public.get_support_ticket_by_id(p_ticket_id UUID)
RETURNS SETOF support_tickets 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM support_tickets WHERE id = p_ticket_id;
END;
$$;

-- Получить тикеты поддержки пользователя
CREATE OR REPLACE FUNCTION public.get_user_support_tickets(p_user_id UUID)
RETURNS SETOF support_tickets 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM support_tickets WHERE author_id = p_user_id ORDER BY created_at DESC;
END;
$$;

-- Получить все тикеты поддержки (для админов)
CREATE OR REPLACE FUNCTION public.get_all_support_tickets()
RETURNS SETOF support_tickets 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM support_tickets ORDER BY created_at DESC;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ УВЕДОМЛЕНИЙ =====

-- Получить уведомление по ID
CREATE OR REPLACE FUNCTION public.get_notification_by_id(p_notification_id UUID)
RETURNS SETOF notifications 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM notifications WHERE id = p_notification_id;
END;
$$;

-- Получить уведомления пользователя
CREATE OR REPLACE FUNCTION public.get_user_notifications(p_user_id UUID)
RETURNS SETOF notifications 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM notifications WHERE recipient_id = p_user_id ORDER BY created_at DESC;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ ЗАЯВОК =====

-- Получить заявку по ID
CREATE OR REPLACE FUNCTION public.get_application_by_id(p_application_id UUID)
RETURNS SETOF applications 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM applications WHERE id = p_application_id;
END;
$$;

-- Получить заявки пользователя
CREATE OR REPLACE FUNCTION public.get_user_applications(p_user_id UUID)
RETURNS SETOF applications 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM applications WHERE author_id = p_user_id ORDER BY created_at DESC;
END;
$$;

-- Получить все заявки (для админов)
CREATE OR REPLACE FUNCTION public.get_all_applications()
RETURNS SETOF applications 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM applications ORDER BY created_at DESC;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ РАПОРТОВ =====

-- Получить рапорт по ID
CREATE OR REPLACE FUNCTION public.get_report_by_id(p_report_id UUID)
RETURNS SETOF reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM reports WHERE id = p_report_id;
END;
$$;

-- Получить рапорты пользователя
CREATE OR REPLACE FUNCTION public.get_user_reports(p_user_id UUID)
RETURNS SETOF reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM reports WHERE author_id = p_user_id ORDER BY created_at DESC;
END;
$$;

-- Получить все рапорты (для админов)
CREATE OR REPLACE FUNCTION public.get_all_reports()
RETURNS SETOF reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM reports ORDER BY created_at DESC;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ =====

-- Получить пользователя по ID
CREATE OR REPLACE FUNCTION public.get_user_by_id(p_user_id UUID)
RETURNS SETOF users 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE id = p_user_id;
END;
$$;

-- Получить всех пользователей (для админов)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF users 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM users ORDER BY username;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ ДЕПАРТАМЕНТОВ =====

-- Получить департамент по ID
CREATE OR REPLACE FUNCTION public.get_department_by_id(p_department_id UUID)
RETURNS SETOF departments 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM departments WHERE id = p_department_id;
END;
$$;

-- Получить все департаменты
CREATE OR REPLACE FUNCTION public.get_all_departments()
RETURNS SETOF departments 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM departments ORDER BY name;
END;
$$;

-- ===== СТАТИСТИЧЕСКИЕ ФУНКЦИИ =====

-- Получить статистику тестов
CREATE OR REPLACE FUNCTION public.get_test_statistics()
RETURNS TABLE(
  total_tests BIGINT,
  total_attempts BIGINT,
  total_passed BIGINT,
  avg_score NUMERIC
) 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    COUNT(DISTINCT t.id)::BIGINT as total_tests,
    COUNT(tr.id)::BIGINT as total_attempts,
    COUNT(tr.id) FILTER (WHERE tr.passed = true)::BIGINT as total_passed,
    AVG(tr.percentage)::NUMERIC as avg_score
  FROM tests t
  LEFT JOIN test_results tr ON t.id = tr.test_id;
END;
$$;

-- Получить статистику рапортов
CREATE OR REPLACE FUNCTION public.get_report_statistics()
RETURNS TABLE(
  total_reports BIGINT,
  draft_reports BIGINT,
  submitted_reports BIGINT,
  approved_reports BIGINT,
  rejected_reports BIGINT
) 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    COUNT(*)::BIGINT as total_reports,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_reports,
    COUNT(*) FILTER (WHERE status = 'submitted')::BIGINT as submitted_reports,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_reports,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_reports
  FROM filled_reports;
END;
$$;

-- Получить статистику заявок
CREATE OR REPLACE FUNCTION public.get_application_statistics()
RETURNS TABLE(
  total_applications BIGINT,
  pending_applications BIGINT,
  approved_applications BIGINT,
  rejected_applications BIGINT
) 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    COUNT(*)::BIGINT as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_applications,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_applications,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_applications
  FROM applications;
END;
$$;

-- ===== ПРАВА ДОСТУПА =====

-- Предоставить права на выполнение RPC функций
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;