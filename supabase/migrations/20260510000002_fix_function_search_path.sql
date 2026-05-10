-- ============================================================
-- Corrige el search_path mutable en todas las funciones de trigger
-- ============================================================

CREATE OR REPLACE FUNCTION fn_check_dia_ciclo_range()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dia_ciclo < 1 OR NEW.dia_ciclo > (
    SELECT duracion_dias FROM public.ciclo_horario WHERE id_ciclo = NEW.id_ciclo
  ) THEN
    RAISE EXCEPTION 'dia_ciclo (%) debe estar entre 1 y duracion_dias del ciclo', NEW.dia_ciclo;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_asignacion_solapamiento()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.asignacion_horario
    WHERE legajo = NEW.legajo
      AND id_asignacion != COALESCE(NEW.id_asignacion, -1)
      AND fecha_desde <= COALESCE(NEW.fecha_hasta, 'infinity'::date)
      AND COALESCE(fecha_hasta, 'infinity'::date) >= NEW.fecha_desde
  ) THEN
    RAISE EXCEPTION 'El empleado ya tiene una asignación de horario activa en ese período';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_empleado_ciclo_solapamiento()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.empleado_ciclo
    WHERE legajo = NEW.legajo
      AND id != COALESCE(NEW.id, -1)
      AND fecha_inicio <= COALESCE(NEW.fecha_fin, 'infinity'::date)
      AND COALESCE(fecha_fin, 'infinity'::date) >= NEW.fecha_inicio
  ) THEN
    RAISE EXCEPTION 'El empleado ya tiene un ciclo rotativo activo en ese período';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_asignacion_vs_ciclo()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.empleado_ciclo
    WHERE legajo = NEW.legajo
      AND fecha_inicio <= COALESCE(NEW.fecha_hasta, 'infinity'::date)
      AND COALESCE(fecha_fin, 'infinity'::date) >= NEW.fecha_desde
  ) THEN
    RAISE EXCEPTION 'El empleado tiene un EmpleadoCiclo activo que se solapa con esta asignación de horario';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_ciclo_vs_asignacion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.asignacion_horario
    WHERE legajo = NEW.legajo
      AND fecha_desde <= COALESCE(NEW.fecha_fin, 'infinity'::date)
      AND COALESCE(fecha_hasta, 'infinity'::date) >= NEW.fecha_inicio
  ) THEN
    RAISE EXCEPTION 'El empleado tiene una AsignacionHorario activa que se solapa con este ciclo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_cierre_inmutable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'cerrado' THEN
    RAISE EXCEPTION 'No se puede modificar un cierre mensual ya cerrado (período: %)', OLD.periodo;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_cierre_no_eliminar()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'cerrado' THEN
    RAISE EXCEPTION 'No se puede eliminar un cierre mensual ya cerrado (período: %)', OLD.periodo;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

CREATE OR REPLACE FUNCTION fn_check_detalle_inmutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'El snapshot de CierreMensualDetalle es inmutable y no puede modificarse';
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';
