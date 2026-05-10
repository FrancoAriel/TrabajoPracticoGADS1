-- ============================================================
-- Capitalizar valores de todos los enums existentes
-- Agregar enums para categoria_laboral y convenio
-- ============================================================

-- ============================================================
-- 1. RENOMBRAR VALORES DE ENUMS EXISTENTES
-- ============================================================

ALTER TYPE tipo_jornada_enum     RENAME VALUE 'completa'   TO 'Completa';
ALTER TYPE tipo_jornada_enum     RENAME VALUE 'parcial'    TO 'Parcial';

ALTER TYPE estado_empleado_enum  RENAME VALUE 'activo'     TO 'Activo';
ALTER TYPE estado_empleado_enum  RENAME VALUE 'inactivo'   TO 'Inactivo';
ALTER TYPE estado_empleado_enum  RENAME VALUE 'suspendido' TO 'Suspendido';

ALTER TYPE tipo_horario_enum     RENAME VALUE 'fijo'       TO 'Fijo';
ALTER TYPE tipo_horario_enum     RENAME VALUE 'flexible'   TO 'Flexible';
ALTER TYPE tipo_horario_enum     RENAME VALUE 'rotativo'   TO 'Rotativo';

ALTER TYPE modo_flexibilidad_enum RENAME VALUE 'diaria'    TO 'Diaria';
ALTER TYPE modo_flexibilidad_enum RENAME VALUE 'semanal'   TO 'Semanal';

ALTER TYPE tipo_fichada_enum     RENAME VALUE 'entrada'    TO 'Entrada';
ALTER TYPE tipo_fichada_enum     RENAME VALUE 'salida'     TO 'Salida';

ALTER TYPE origen_fichada_enum   RENAME VALUE 'biometrico' TO 'Biometrico';
ALTER TYPE origen_fichada_enum   RENAME VALUE 'manual'     TO 'Manual';
ALTER TYPE origen_fichada_enum   RENAME VALUE 'qr'         TO 'Qr';
ALTER TYPE origen_fichada_enum   RENAME VALUE 'api'        TO 'Api';
ALTER TYPE origen_fichada_enum   RENAME VALUE 'pin'        TO 'Pin';

ALTER TYPE tipo_novedad_enum     RENAME VALUE 'tardanza'         TO 'Tardanza';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'ausencia'         TO 'Ausencia';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'horas_extra_50'   TO 'Horas_extra_50';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'horas_extra_100'  TO 'Horas_extra_100';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'horas_faltantes'  TO 'Horas_faltantes';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'salida_anticipada' TO 'Salida_anticipada';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'licencia'         TO 'Licencia';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'suspension'       TO 'Suspension';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'vacaciones'       TO 'Vacaciones';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'permiso_especial' TO 'Permiso_especial';
ALTER TYPE tipo_novedad_enum     RENAME VALUE 'justificacion'    TO 'Justificacion';

ALTER TYPE unidad_novedad_enum   RENAME VALUE 'minutos'    TO 'Minutos';
ALTER TYPE unidad_novedad_enum   RENAME VALUE 'horas'      TO 'Horas';
ALTER TYPE unidad_novedad_enum   RENAME VALUE 'dias'       TO 'Dias';

ALTER TYPE estado_novedad_enum   RENAME VALUE 'pendiente'  TO 'Pendiente';
ALTER TYPE estado_novedad_enum   RENAME VALUE 'aprobada'   TO 'Aprobada';
ALTER TYPE estado_novedad_enum   RENAME VALUE 'rechazada'  TO 'Rechazada';

ALTER TYPE origen_novedad_enum   RENAME VALUE 'automatica' TO 'Automatica';
ALTER TYPE origen_novedad_enum   RENAME VALUE 'manual'     TO 'Manual';

ALTER TYPE rol_usuario_enum      RENAME VALUE 'admin'      TO 'Admin';
ALTER TYPE rol_usuario_enum      RENAME VALUE 'empleado'   TO 'Empleado';
ALTER TYPE rol_usuario_enum      RENAME VALUE 'contador'   TO 'Contador';

ALTER TYPE estado_usuario_enum   RENAME VALUE 'activo'     TO 'Activo';
ALTER TYPE estado_usuario_enum   RENAME VALUE 'inactivo'   TO 'Inactivo';
ALTER TYPE estado_usuario_enum   RENAME VALUE 'suspendido' TO 'Suspendido';

ALTER TYPE estado_cierre_enum    RENAME VALUE 'borrador'   TO 'Borrador';
ALTER TYPE estado_cierre_enum    RENAME VALUE 'cerrado'    TO 'Cerrado';

-- ============================================================
-- 2. RECREAR CHECK CONSTRAINT chk_horario_flexible
--    (referenciaba 'flexible', 'diaria', 'semanal' en minúscula)
-- ============================================================

ALTER TABLE public.horario DROP CONSTRAINT chk_horario_flexible;

ALTER TABLE public.horario ADD CONSTRAINT chk_horario_flexible CHECK (
  tipo != 'Flexible' OR (
    modo_flexibilidad IS NOT NULL
    AND NOT (horas_objetivo_diarias IS NOT NULL AND horas_objetivo_semanales IS NOT NULL)
    AND (horas_objetivo_diarias IS NOT NULL OR horas_objetivo_semanales IS NOT NULL)
    AND (modo_flexibilidad != 'Diaria'  OR horas_objetivo_diarias IS NOT NULL)
    AND (modo_flexibilidad != 'Semanal' OR horas_objetivo_semanales IS NOT NULL)
  )
);

-- ============================================================
-- 3. RECREAR TRIGGER FUNCTIONS que comparan valores de enum
-- ============================================================

CREATE OR REPLACE FUNCTION fn_check_cierre_inmutable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'Cerrado' THEN
    RAISE EXCEPTION 'No se puede modificar un cierre mensual ya cerrado (período: %)', OLD.periodo;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_cierre_no_eliminar()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'Cerrado' THEN
    RAISE EXCEPTION 'No se puede eliminar un cierre mensual ya cerrado (período: %)', OLD.periodo;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = '';

-- ============================================================
-- 4. NUEVOS ENUMS: categoria_laboral y convenio
-- ============================================================

CREATE TYPE categoria_laboral_enum AS ENUM (
  'Administrativo',
  'Operario / Planta',
  'Técnico',
  'Supervisor',
  'Gerencia'
);

CREATE TYPE convenio_enum AS ENUM (
  'Comercio (130/75)',
  'Metalúrgico (260/75)',
  'Gastronómico (389/04)',
  'Construcción (76/75)',
  'Otro'
);

-- ============================================================
-- 5. NORMALIZAR DATOS EXISTENTES antes de castear las columnas
-- ============================================================

UPDATE public.empleado SET categoria_laboral = 'Administrativo'   WHERE categoria_laboral ILIKE '%administrat%';
UPDATE public.empleado SET categoria_laboral = 'Operario / Planta' WHERE categoria_laboral ILIKE '%operari%';
UPDATE public.empleado SET categoria_laboral = 'Técnico'           WHERE categoria_laboral ILIKE '%tecni%' OR categoria_laboral ILIKE '%técni%';
UPDATE public.empleado SET categoria_laboral = 'Supervisor'        WHERE categoria_laboral ILIKE '%supervis%';
UPDATE public.empleado SET categoria_laboral = 'Gerencia'          WHERE categoria_laboral ILIKE '%gerenci%';
-- Valores que no matcheen quedan en NULL para poder castear sin error
UPDATE public.empleado SET categoria_laboral = NULL
  WHERE categoria_laboral IS NOT NULL
    AND categoria_laboral NOT IN ('Administrativo','Operario / Planta','Técnico','Supervisor','Gerencia');

UPDATE public.empleado SET convenio = 'Comercio (130/75)'      WHERE convenio ILIKE '%130%';
UPDATE public.empleado SET convenio = 'Metalúrgico (260/75)'   WHERE convenio ILIKE '%260%' OR convenio ILIKE '%metalurg%' OR convenio ILIKE '%metalúrg%';
UPDATE public.empleado SET convenio = 'Gastronómico (389/04)'  WHERE convenio ILIKE '%389%' OR convenio ILIKE '%gastron%';
UPDATE public.empleado SET convenio = 'Construcción (76/75)'   WHERE convenio ILIKE '%76%'  OR convenio ILIKE '%construc%';
-- Valores que no matcheen → Otro
UPDATE public.empleado SET convenio = 'Otro'
  WHERE convenio IS NOT NULL
    AND convenio NOT IN ('Comercio (130/75)','Metalúrgico (260/75)','Gastronómico (389/04)','Construcción (76/75)','Otro');

-- ============================================================
-- 6. CASTEAR COLUMNAS AL NUEVO TIPO ENUM
-- ============================================================

ALTER TABLE public.empleado
  ALTER COLUMN categoria_laboral TYPE categoria_laboral_enum
  USING categoria_laboral::categoria_laboral_enum;

ALTER TABLE public.empleado
  ALTER COLUMN convenio TYPE convenio_enum
  USING convenio::convenio_enum;
