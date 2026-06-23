-- Ausencias automáticas al cierre del día operativo (servidor / BD — no en el navegador).
-- Sin argumento: procesa el día calendario anterior en America/Argentina/Buenos_Aires (típico job post-medianoche).
-- Programación sugerida (pg_cron, si está habilitado en el proyecto):
--   SELECT cron.schedule('ausencias-fin-dia', '10 0 * * *', $$ SELECT public.registrar_ausencias_fin_dia() $$);
-- (minuto 10 hora 0 en UTC puede requerir ajuste; conviene fijar TZ del servidor o pasar fecha explícita.)

CREATE OR REPLACE FUNCTION public.horario_asignado_en_fecha(p_legajo integer, p_fecha date)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path TO public
AS $$
  WITH asign AS (
    SELECT a.id_horario
    FROM asignacion_horario a
    WHERE a.legajo = p_legajo
      AND a.fecha_desde <= p_fecha
      AND (a.fecha_hasta IS NULL OR p_fecha <= a.fecha_hasta)
    ORDER BY a.fecha_desde DESC
    LIMIT 1
  ),
  ciclo AS (
    SELECT chd.id_horario
    FROM empleado_ciclo ec
    INNER JOIN ciclo_horario c ON c.id_ciclo = ec.id_ciclo
    INNER JOIN ciclo_horario_detalle chd
      ON chd.id_ciclo = ec.id_ciclo
     AND chd.dia_ciclo = (
       ((p_fecha - ec.fecha_inicio) % NULLIF(c.duracion_dias, 0)) + 1
     )
    WHERE ec.legajo = p_legajo
      AND p_fecha >= ec.fecha_inicio
      AND (ec.fecha_fin IS NULL OR p_fecha <= ec.fecha_fin)
    LIMIT 1
  )
  SELECT COALESCE(
    (SELECT id_horario FROM asign),
    (SELECT id_horario FROM ciclo)
  );
$$;

CREATE OR REPLACE FUNCTION public.es_dia_laboral_horario(p_id_horario integer, p_fecha date)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM horario_dia hd
    WHERE hd.id_horario = p_id_horario
      AND hd.dia_semana = EXTRACT(ISODOW FROM p_fecha)::integer
      AND hd.es_laborable IS TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.registrar_ausencias_fin_dia(p_fecha date DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_fecha date;
  v_tz  text := 'America/Argentina/Buenos_Aires';
  n     int;
BEGIN
  v_fecha := COALESCE(
    p_fecha,
    (timezone(v_tz, now()))::date - 1
  );

  WITH candidatos AS (
    SELECT
      e.legajo::integer AS leg,
      public.horario_asignado_en_fecha(e.legajo::integer, v_fecha) AS id_h
    FROM empleado e
    WHERE e.estado = 'Activo'
  ),
  laboran AS (
    SELECT c.leg
    FROM candidatos c
    WHERE c.id_h IS NOT NULL
      AND public.es_dia_laboral_horario(c.id_h, v_fecha)
  ),
  con_entrada AS (
    SELECT DISTINCT f.legajo
    FROM fichada f
    WHERE f.fecha_hora::date = v_fecha
      AND f.tipo = 'Entrada'
      AND f.es_correccion IS NOT TRUE
  ),
  cubiertos AS (
    SELECT n.legajo
    FROM novedad n
    WHERE n.fecha_desde <= v_fecha
      AND (n.fecha_hasta IS NULL OR v_fecha <= n.fecha_hasta)
      AND n.estado IN ('Pendiente'::estado_novedad_enum, 'Aprobada'::estado_novedad_enum)
      AND n.tipo IN (
        'Ausencia'::tipo_novedad_enum,
        'Licencia'::tipo_novedad_enum,
        'Vacaciones'::tipo_novedad_enum,
        'Justificacion'::tipo_novedad_enum,
        'Permiso_especial'::tipo_novedad_enum
      )
  ),
  ya_automatica AS (
    SELECT n.legajo
    FROM novedad n
    WHERE n.fecha_desde = v_fecha
      AND n.tipo = 'Ausencia'::tipo_novedad_enum
      AND n.origen = 'Automatica'::origen_novedad_enum
  ),
  inserted AS (
    INSERT INTO novedad (
      legajo,
      tipo,
      fecha_desde,
      fecha_hasta,
      cantidad,
      unidad,
      estado,
      origen,
      observacion,
      fecha_creacion,
      id_usuario_creacion
    )
    SELECT
      l.leg,
      'Ausencia'::tipo_novedad_enum,
      v_fecha,
      v_fecha,
      1,
      'Dias'::unidad_novedad_enum,
      'Pendiente'::estado_novedad_enum,
      'Automatica'::origen_novedad_enum,
      'Ausencia automática al cierre del día: sin fichada de entrada.',
      now(),
      NULL
    FROM laboran l
    WHERE NOT EXISTS (SELECT 1 FROM con_entrada c WHERE c.legajo = l.leg)
      AND NOT EXISTS (SELECT 1 FROM cubiertos x WHERE x.legajo = l.leg)
      AND NOT EXISTS (SELECT 1 FROM ya_automatica y WHERE y.legajo = l.leg)
    RETURNING legajo
  )
  SELECT count(*)::int INTO n FROM inserted;

  RETURN COALESCE(n, 0);
END;
$$;

COMMENT ON FUNCTION public.registrar_ausencias_fin_dia(date) IS
  'Cierre diario: inserta novedad Ausencia automática si el empleado debía trabajar, no fichó entrada y no está cubierto por otra novedad.';

GRANT EXECUTE ON FUNCTION public.registrar_ausencias_fin_dia(date) TO service_role;
