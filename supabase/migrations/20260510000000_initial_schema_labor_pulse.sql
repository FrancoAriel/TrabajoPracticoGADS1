-- ============================================================
-- Labor Pulse – Esquema inicial
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE tipo_jornada_enum AS ENUM ('completa', 'parcial');
CREATE TYPE estado_empleado_enum AS ENUM ('activo', 'inactivo', 'suspendido');
CREATE TYPE tipo_horario_enum AS ENUM ('fijo', 'flexible', 'rotativo');
CREATE TYPE modo_flexibilidad_enum AS ENUM ('diaria', 'semanal');
CREATE TYPE tipo_fichada_enum AS ENUM ('entrada', 'salida');
CREATE TYPE origen_fichada_enum AS ENUM ('biometrico', 'manual', 'qr', 'api', 'pin');
CREATE TYPE tipo_novedad_enum AS ENUM (
  'tardanza', 'ausencia', 'horas_extra_50', 'horas_extra_100',
  'horas_faltantes', 'salida_anticipada', 'licencia', 'suspension',
  'vacaciones', 'permiso_especial', 'justificacion'
);
CREATE TYPE unidad_novedad_enum AS ENUM ('minutos', 'horas', 'dias');
CREATE TYPE estado_novedad_enum AS ENUM ('pendiente', 'aprobada', 'rechazada');
CREATE TYPE origen_novedad_enum AS ENUM ('automatica', 'manual');
CREATE TYPE rol_usuario_enum AS ENUM ('admin', 'empleado', 'contador');
CREATE TYPE estado_usuario_enum AS ENUM ('activo', 'inactivo', 'suspendido');
CREATE TYPE estado_cierre_enum AS ENUM ('borrador', 'cerrado');

-- ============================================================
-- EMPLEADO
-- ============================================================
CREATE TABLE empleado (
  legajo            SERIAL PRIMARY KEY,
  nombre            VARCHAR NOT NULL,
  apellido          VARCHAR NOT NULL,
  dni               VARCHAR NOT NULL UNIQUE,
  cuil              VARCHAR NOT NULL UNIQUE,
  fecha_ingreso     DATE NOT NULL,
  fecha_egreso      DATE,
  categoria_laboral VARCHAR,
  convenio          VARCHAR,
  tipo_jornada      tipo_jornada_enum NOT NULL,
  estado            estado_empleado_enum NOT NULL
);

-- ============================================================
-- HORARIO
-- ============================================================
CREATE TABLE horario (
  id_horario               SERIAL PRIMARY KEY,
  nombre                   VARCHAR NOT NULL,
  tipo                     tipo_horario_enum NOT NULL,
  tolerancia_entrada_min   INTEGER,
  tolerancia_salida_min    INTEGER,
  descanso_minimo_min      INTEGER,
  umbral_horas_extra_min   INTEGER,
  modo_flexibilidad        modo_flexibilidad_enum,
  horas_objetivo_semanales DECIMAL,
  horas_objetivo_diarias   DECIMAL,
  -- Si tipo = flexible:
  --   modo_flexibilidad NOT NULL
  --   NO pueden tener ambas horas_objetivo_diarias y horas_objetivo_semanales
  --   modo diaria  → horas_objetivo_diarias NOT NULL
  --   modo semanal → horas_objetivo_semanales NOT NULL
  CONSTRAINT chk_horario_flexible CHECK (
    tipo != 'flexible' OR (
      modo_flexibilidad IS NOT NULL
      AND NOT (horas_objetivo_diarias IS NOT NULL AND horas_objetivo_semanales IS NOT NULL)
      AND (horas_objetivo_diarias IS NOT NULL OR horas_objetivo_semanales IS NOT NULL)
      AND (modo_flexibilidad != 'diaria'  OR horas_objetivo_diarias IS NOT NULL)
      AND (modo_flexibilidad != 'semanal' OR horas_objetivo_semanales IS NOT NULL)
    )
  )
);

-- ============================================================
-- HORARIO DIA
-- ============================================================
CREATE TABLE horario_dia (
  id_horario_dia SERIAL PRIMARY KEY,
  id_horario     INTEGER NOT NULL REFERENCES horario(id_horario),
  dia_semana     INTEGER NOT NULL,
  hora_entrada   TIME,
  hora_salida    TIME,
  es_laborable   BOOLEAN NOT NULL,
  UNIQUE (id_horario, dia_semana),
  CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 1 AND 7),
  CONSTRAINT chk_no_laborable_horas CHECK (
    es_laborable = true OR (hora_entrada IS NULL AND hora_salida IS NULL)
  )
);

-- ============================================================
-- USUARIO  (antes de Fichada y Novedad porque es referenciado por ellas)
-- ============================================================
CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  legajo     INTEGER REFERENCES empleado(legajo),
  nombre     VARCHAR NOT NULL,
  email      VARCHAR NOT NULL UNIQUE,
  password   VARCHAR NOT NULL,
  rol        rol_usuario_enum NOT NULL,
  estado     estado_usuario_enum NOT NULL,
  CONSTRAINT chk_empleado_requiere_legajo CHECK (
    rol != 'empleado' OR legajo IS NOT NULL
  )
);

-- ============================================================
-- ASIGNACION HORARIO  (fijo y flexible)
-- ============================================================
CREATE TABLE asignacion_horario (
  id_asignacion SERIAL PRIMARY KEY,
  legajo        INTEGER NOT NULL REFERENCES empleado(legajo),
  id_horario    INTEGER NOT NULL REFERENCES horario(id_horario),
  fecha_desde   DATE NOT NULL,
  fecha_hasta   DATE,
  CONSTRAINT chk_asignacion_fechas CHECK (
    fecha_hasta IS NULL OR fecha_hasta >= fecha_desde
  )
);

-- ============================================================
-- CICLO HORARIO  (rotativos)
-- ============================================================
CREATE TABLE ciclo_horario (
  id_ciclo      SERIAL PRIMARY KEY,
  nombre        VARCHAR NOT NULL,
  duracion_dias INTEGER NOT NULL,
  CONSTRAINT chk_duracion_positiva CHECK (duracion_dias > 0)
);

-- ============================================================
-- CICLO HORARIO DETALLE
-- ============================================================
CREATE TABLE ciclo_horario_detalle (
  id_detalle SERIAL PRIMARY KEY,
  id_ciclo   INTEGER NOT NULL REFERENCES ciclo_horario(id_ciclo),
  dia_ciclo  INTEGER NOT NULL,
  id_horario INTEGER NOT NULL REFERENCES horario(id_horario),
  UNIQUE (id_ciclo, dia_ciclo)
  -- Rango de dia_ciclo validado por trigger fn_check_dia_ciclo_range
);

-- ============================================================
-- EMPLEADO CICLO
-- ============================================================
CREATE TABLE empleado_ciclo (
  id           SERIAL PRIMARY KEY,
  legajo       INTEGER NOT NULL REFERENCES empleado(legajo),
  id_ciclo     INTEGER NOT NULL REFERENCES ciclo_horario(id_ciclo),
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE,
  CONSTRAINT chk_empleado_ciclo_fechas CHECK (
    fecha_fin IS NULL OR fecha_fin >= fecha_inicio
  )
);

-- ============================================================
-- FICHADA
-- ============================================================
CREATE TABLE fichada (
  id_fichada          SERIAL PRIMARY KEY,
  legajo              INTEGER NOT NULL REFERENCES empleado(legajo),
  fecha_hora          TIMESTAMP NOT NULL,
  tipo                tipo_fichada_enum NOT NULL,
  origen              origen_fichada_enum NOT NULL,
  id_usuario_registro INTEGER REFERENCES usuario(id_usuario),
  es_correccion       BOOLEAN NOT NULL DEFAULT false,
  id_fichada_original INTEGER REFERENCES fichada(id_fichada),
  UNIQUE (legajo, fecha_hora, tipo),
  CONSTRAINT chk_correccion CHECK (
    (es_correccion = true  AND id_fichada_original IS NOT NULL) OR
    (es_correccion = false AND id_fichada_original IS NULL)
  )
);

-- ============================================================
-- NOVEDAD
-- ============================================================
CREATE TABLE novedad (
  id_novedad          SERIAL PRIMARY KEY,
  legajo              INTEGER NOT NULL REFERENCES empleado(legajo),
  tipo                tipo_novedad_enum NOT NULL,
  fecha_desde         DATE NOT NULL,
  fecha_hasta         DATE,
  cantidad            DECIMAL,
  unidad              unidad_novedad_enum NOT NULL,
  estado              estado_novedad_enum NOT NULL,
  origen              origen_novedad_enum NOT NULL,
  observacion         TEXT,
  fecha_creacion      TIMESTAMP NOT NULL,
  id_usuario_creacion INTEGER REFERENCES usuario(id_usuario),
  CONSTRAINT chk_novedad_fechas CHECK (
    fecha_hasta IS NULL OR fecha_hasta >= fecha_desde
  ),
  CONSTRAINT chk_cantidad_positiva CHECK (
    cantidad IS NULL OR cantidad >= 0
  )
);

-- ============================================================
-- CIERRE MENSUAL
-- ============================================================
CREATE TABLE cierre_mensual (
  id_cierre         SERIAL PRIMARY KEY,
  periodo           VARCHAR NOT NULL,
  fecha_cierre      DATE NOT NULL,
  estado            estado_cierre_enum NOT NULL,
  id_usuario        INTEGER NOT NULL REFERENCES usuario(id_usuario),
  archivo_exportado VARCHAR NOT NULL
);

-- Solo puede existir un cierre en estado 'cerrado' por período
CREATE UNIQUE INDEX idx_cierre_unico_cerrado
  ON cierre_mensual(periodo)
  WHERE estado = 'cerrado';

-- ============================================================
-- CIERRE MENSUAL DETALLE  (snapshot inmutable)
-- ============================================================
CREATE TABLE cierre_mensual_detalle (
  id             SERIAL PRIMARY KEY,
  id_cierre      INTEGER NOT NULL REFERENCES cierre_mensual(id_cierre),
  id_novedad     INTEGER REFERENCES novedad(id_novedad),
  -- Snapshot de datos (copia inmutable de la novedad al momento del cierre)
  legajo         INTEGER,
  tipo_novedad   tipo_novedad_enum,
  fecha_desde    DATE,
  fecha_hasta    DATE,
  cantidad       DECIMAL,
  unidad         unidad_novedad_enum,
  observacion    TEXT,
  origen         origen_novedad_enum,
  fecha_creacion TIMESTAMP
);

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================
CREATE INDEX idx_asignacion_legajo     ON asignacion_horario(legajo);
CREATE INDEX idx_asignacion_fechas     ON asignacion_horario(legajo, fecha_desde, fecha_hasta);
CREATE INDEX idx_empleado_ciclo_legajo ON empleado_ciclo(legajo);
CREATE INDEX idx_empleado_ciclo_fechas ON empleado_ciclo(legajo, fecha_inicio, fecha_fin);
CREATE INDEX idx_fichada_legajo        ON fichada(legajo);
CREATE INDEX idx_fichada_fecha_hora    ON fichada(legajo, fecha_hora);
CREATE INDEX idx_novedad_legajo        ON novedad(legajo);
CREATE INDEX idx_novedad_estado        ON novedad(estado);
CREATE INDEX idx_novedad_legajo_fechas ON novedad(legajo, fecha_desde, fecha_hasta);
CREATE INDEX idx_cierre_mensual_periodo ON cierre_mensual(periodo);
CREATE INDEX idx_cierre_detalle_cierre ON cierre_mensual_detalle(id_cierre);
CREATE INDEX idx_horario_dia_horario   ON horario_dia(id_horario);
CREATE INDEX idx_ciclo_detalle_ciclo   ON ciclo_horario_detalle(id_ciclo);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Valida que dia_ciclo esté dentro del rango [1, duracion_dias] del ciclo
CREATE OR REPLACE FUNCTION fn_check_dia_ciclo_range()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dia_ciclo < 1 OR NEW.dia_ciclo > (
    SELECT duracion_dias FROM ciclo_horario WHERE id_ciclo = NEW.id_ciclo
  ) THEN
    RAISE EXCEPTION 'dia_ciclo (%) debe estar entre 1 y duracion_dias del ciclo', NEW.dia_ciclo;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_dia_ciclo
BEFORE INSERT OR UPDATE ON ciclo_horario_detalle
FOR EACH ROW EXECUTE FUNCTION fn_check_dia_ciclo_range();

-- Valida que no haya dos AsignacionHorario superpuestas para el mismo empleado
CREATE OR REPLACE FUNCTION fn_check_asignacion_solapamiento()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM asignacion_horario
    WHERE legajo = NEW.legajo
      AND id_asignacion != COALESCE(NEW.id_asignacion, -1)
      AND fecha_desde <= COALESCE(NEW.fecha_hasta, 'infinity'::date)
      AND COALESCE(fecha_hasta, 'infinity'::date) >= NEW.fecha_desde
  ) THEN
    RAISE EXCEPTION 'El empleado ya tiene una asignación de horario activa en ese período';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_asignacion_solapamiento
BEFORE INSERT OR UPDATE ON asignacion_horario
FOR EACH ROW EXECUTE FUNCTION fn_check_asignacion_solapamiento();

-- Valida que no haya dos EmpleadoCiclo superpuestos para el mismo empleado
CREATE OR REPLACE FUNCTION fn_check_empleado_ciclo_solapamiento()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM empleado_ciclo
    WHERE legajo = NEW.legajo
      AND id != COALESCE(NEW.id, -1)
      AND fecha_inicio <= COALESCE(NEW.fecha_fin, 'infinity'::date)
      AND COALESCE(fecha_fin, 'infinity'::date) >= NEW.fecha_inicio
  ) THEN
    RAISE EXCEPTION 'El empleado ya tiene un ciclo rotativo activo en ese período';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_empleado_ciclo_solapamiento
BEFORE INSERT OR UPDATE ON empleado_ciclo
FOR EACH ROW EXECUTE FUNCTION fn_check_empleado_ciclo_solapamiento();

-- Un empleado NO puede tener AsignacionHorario activa y EmpleadoCiclo activo al mismo tiempo
CREATE OR REPLACE FUNCTION fn_check_asignacion_vs_ciclo()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM empleado_ciclo
    WHERE legajo = NEW.legajo
      AND fecha_inicio <= COALESCE(NEW.fecha_hasta, 'infinity'::date)
      AND COALESCE(fecha_fin, 'infinity'::date) >= NEW.fecha_desde
  ) THEN
    RAISE EXCEPTION 'El empleado tiene un EmpleadoCiclo activo que se solapa con esta asignación de horario';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_asignacion_vs_ciclo
BEFORE INSERT OR UPDATE ON asignacion_horario
FOR EACH ROW EXECUTE FUNCTION fn_check_asignacion_vs_ciclo();

CREATE OR REPLACE FUNCTION fn_check_ciclo_vs_asignacion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM asignacion_horario
    WHERE legajo = NEW.legajo
      AND fecha_desde <= COALESCE(NEW.fecha_fin, 'infinity'::date)
      AND COALESCE(fecha_hasta, 'infinity'::date) >= NEW.fecha_inicio
  ) THEN
    RAISE EXCEPTION 'El empleado tiene una AsignacionHorario activa que se solapa con este ciclo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_ciclo_vs_asignacion
BEFORE INSERT OR UPDATE ON empleado_ciclo
FOR EACH ROW EXECUTE FUNCTION fn_check_ciclo_vs_asignacion();

-- CierreMensual es inmutable una vez en estado 'cerrado'
CREATE OR REPLACE FUNCTION fn_check_cierre_inmutable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'cerrado' THEN
    RAISE EXCEPTION 'No se puede modificar un cierre mensual ya cerrado (período: %)', OLD.periodo;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cierre_inmutable
BEFORE UPDATE ON cierre_mensual
FOR EACH ROW EXECUTE FUNCTION fn_check_cierre_inmutable();

-- CierreMensual no puede eliminarse si ya fue cerrado
CREATE OR REPLACE FUNCTION fn_check_cierre_no_eliminar()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado = 'cerrado' THEN
    RAISE EXCEPTION 'No se puede eliminar un cierre mensual ya cerrado (período: %)', OLD.periodo;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cierre_no_eliminar
BEFORE DELETE ON cierre_mensual
FOR EACH ROW EXECUTE FUNCTION fn_check_cierre_no_eliminar();

-- CierreMensualDetalle es inmutable (snapshot no modificable)
CREATE OR REPLACE FUNCTION fn_check_detalle_inmutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'El snapshot de CierreMensualDetalle es inmutable y no puede modificarse';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_detalle_inmutable
BEFORE UPDATE ON cierre_mensual_detalle
FOR EACH ROW EXECUTE FUNCTION fn_check_detalle_inmutable();
