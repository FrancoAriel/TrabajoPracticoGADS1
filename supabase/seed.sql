-- ============================================================
-- Datos de prueba – 3 empleados con horarios, usuarios y fichadas
-- ============================================================

-- HORARIOS
INSERT INTO public.horario (nombre, tipo, tolerancia_entrada_min, tolerancia_salida_min, descanso_minimo_min, umbral_horas_extra_min, modo_flexibilidad, horas_objetivo_semanales, horas_objetivo_diarias)
VALUES
  ('Turno Mañana Fijo', 'fijo',     10, 10, 30, 480, NULL,     NULL, NULL),
  ('Turno Tarde Fijo',  'fijo',     10, 10, 30, 480, NULL,     NULL, NULL),
  ('Flexible Diario',   'flexible', 15, 15, 30, 480, 'diaria', NULL, 8.0);

-- HORARIO_DIA para Turno Mañana (id=1): Lunes-Viernes 08:00-16:00
INSERT INTO public.horario_dia (id_horario, dia_semana, hora_entrada, hora_salida, es_laborable)
VALUES
  (1, 1, '08:00', '16:00', true),
  (1, 2, '08:00', '16:00', true),
  (1, 3, '08:00', '16:00', true),
  (1, 4, '08:00', '16:00', true),
  (1, 5, '08:00', '16:00', true),
  (1, 6, NULL, NULL, false),
  (1, 7, NULL, NULL, false);

-- HORARIO_DIA para Turno Tarde (id=2): Lunes-Viernes 14:00-22:00
INSERT INTO public.horario_dia (id_horario, dia_semana, hora_entrada, hora_salida, es_laborable)
VALUES
  (2, 1, '14:00', '22:00', true),
  (2, 2, '14:00', '22:00', true),
  (2, 3, '14:00', '22:00', true),
  (2, 4, '14:00', '22:00', true),
  (2, 5, '14:00', '22:00', true),
  (2, 6, NULL, NULL, false),
  (2, 7, NULL, NULL, false);

-- EMPLEADOS
INSERT INTO public.empleado (nombre, apellido, dni, cuil, fecha_ingreso, categoria_laboral, convenio, tipo_jornada, estado)
VALUES
  ('Carlos',    'Ramírez',   '28456789', '20-28456789-3', '2020-03-01', 'Administrativo A', 'CCT 130/75', 'completa', 'activo'),
  ('Valentina', 'López',     '34123456', '27-34123456-1', '2022-07-15', 'Operario B',       'CCT 260/75', 'completa', 'activo'),
  ('Nicolás',   'Fernández', '40987654', '20-40987654-9', '2024-01-10', 'Técnico C',        'CCT 130/75', 'parcial',  'activo');

-- USUARIOS (admin + uno por empleado)
INSERT INTO public.usuario (legajo, nombre, email, password, rol, estado)
VALUES
  (NULL, 'Admin Sistema',    'admin@laborpulse.com',             '$2b$10$hashadminXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'admin',    'activo'),
  (1,    'Carlos Ramírez',   'carlos.ramirez@laborpulse.com',    '$2b$10$hashcarlosXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'empleado', 'activo'),
  (2,    'Valentina López',  'valentina.lopez@laborpulse.com',   '$2b$10$hashvalentinaXXXXXXXXXXXXXXXXXXXXXXXX', 'empleado', 'activo'),
  (3,    'Nicolás Fernández','nicolas.fernandez@laborpulse.com', '$2b$10$hashnicolasXXXXXXXXXXXXXXXXXXXXXXXXXX', 'empleado', 'activo');

-- ASIGNACIONES DE HORARIO
INSERT INTO public.asignacion_horario (legajo, id_horario, fecha_desde)
VALUES
  (1, 1, '2020-03-01'),
  (2, 2, '2022-07-15'),
  (3, 3, '2024-01-10');

-- FICHADAS (3 días hábiles recientes por empleado)
INSERT INTO public.fichada (legajo, fecha_hora, tipo, origen, es_correccion)
VALUES
  (1, '2026-05-06 08:03:00', 'entrada', 'biometrico', false),
  (1, '2026-05-06 16:01:00', 'salida',  'biometrico', false),
  (1, '2026-05-07 07:58:00', 'entrada', 'biometrico', false),
  (1, '2026-05-07 16:05:00', 'salida',  'biometrico', false),
  (1, '2026-05-08 08:15:00', 'entrada', 'biometrico', false),
  (1, '2026-05-08 16:00:00', 'salida',  'biometrico', false),

  (2, '2026-05-06 14:00:00', 'entrada', 'biometrico', false),
  (2, '2026-05-06 22:02:00', 'salida',  'biometrico', false),
  (2, '2026-05-07 14:12:00', 'entrada', 'biometrico', false),
  (2, '2026-05-07 22:00:00', 'salida',  'biometrico', false),
  (2, '2026-05-08 13:55:00', 'entrada', 'biometrico', false),
  (2, '2026-05-08 21:58:00', 'salida',  'biometrico', false),

  (3, '2026-05-06 09:30:00', 'entrada', 'qr', false),
  (3, '2026-05-06 17:45:00', 'salida',  'qr', false),
  (3, '2026-05-07 10:00:00', 'entrada', 'qr', false),
  (3, '2026-05-07 18:10:00', 'salida',  'qr', false),
  (3, '2026-05-08 09:45:00', 'entrada', 'qr', false),
  (3, '2026-05-08 17:50:00', 'salida',  'qr', false);

-- NOVEDADES
INSERT INTO public.novedad (legajo, tipo, fecha_desde, fecha_hasta, cantidad, unidad, estado, origen, observacion, fecha_creacion, id_usuario_creacion)
VALUES
  (1, 'tardanza',       '2026-05-08', '2026-05-08', 15, 'minutos', 'aprobada',  'automatica', 'Llegó 15 min tarde',           '2026-05-08 16:01:00', 1),
  (2, 'horas_extra_50', '2026-05-07', '2026-05-07',  1, 'horas',   'pendiente', 'automatica', 'Extensión de jornada',         '2026-05-07 22:01:00', 1),
  (3, 'ausencia',       '2026-05-05', '2026-05-05',  1, 'dias',    'aprobada',  'manual',     'Feriado no laborable acordado','2026-05-04 10:00:00', 1);
