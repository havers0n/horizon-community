-- Обновление представления common.v_effective_roles для включения display_name
-- Это представление теперь джойнится с common.roles, чтобы вернуть как системное имя роли (name),
-- так и человекочитаемое имя (display_name)

CREATE OR REPLACE VIEW common.v_effective_roles AS
SELECT
    ra.user_id,
    ra.subject_type,
    ra.role_id,
    r.name AS role_name,
    r.display_name,
    ra.scope_type,
    ra.scope_id
FROM
    common.role_assignments ra
JOIN
    common.roles r ON ra.role_id = r.id;


