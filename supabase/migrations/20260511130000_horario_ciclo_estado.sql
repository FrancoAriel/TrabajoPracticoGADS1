-- Campo estado (Activo / Inactivo) para borrado lógico en horarios y ciclos.
-- Si existía la columna booleana legacy `activo`, se migra y se elimina.

-- ========== horario ==========
ALTER TABLE public.horario ADD COLUMN IF NOT EXISTS estado TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'horario' AND column_name = 'activo'
  ) THEN
    UPDATE public.horario SET estado = CASE WHEN activo THEN 'Activo' ELSE 'Inactivo' END;
    DROP INDEX IF EXISTS idx_horario_activo;
    ALTER TABLE public.horario DROP COLUMN activo;
  END IF;
END $$;

UPDATE public.horario SET estado = 'Activo' WHERE estado IS NULL OR btrim(estado) = '';

ALTER TABLE public.horario ALTER COLUMN estado SET NOT NULL;
ALTER TABLE public.horario ALTER COLUMN estado SET DEFAULT 'Activo';

ALTER TABLE public.horario DROP CONSTRAINT IF EXISTS horario_estado_chk;
ALTER TABLE public.horario ADD CONSTRAINT horario_estado_chk CHECK (estado IN ('Activo', 'Inactivo'));

CREATE INDEX IF NOT EXISTS idx_horario_estado ON public.horario (estado);

-- ========== ciclo_horario ==========
ALTER TABLE public.ciclo_horario ADD COLUMN IF NOT EXISTS estado TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ciclo_horario' AND column_name = 'activo'
  ) THEN
    UPDATE public.ciclo_horario SET estado = CASE WHEN activo THEN 'Activo' ELSE 'Inactivo' END;
    DROP INDEX IF EXISTS idx_ciclo_horario_activo;
    ALTER TABLE public.ciclo_horario DROP COLUMN activo;
  END IF;
END $$;

UPDATE public.ciclo_horario SET estado = 'Activo' WHERE estado IS NULL OR btrim(estado) = '';

ALTER TABLE public.ciclo_horario ALTER COLUMN estado SET NOT NULL;
ALTER TABLE public.ciclo_horario ALTER COLUMN estado SET DEFAULT 'Activo';

ALTER TABLE public.ciclo_horario DROP CONSTRAINT IF EXISTS ciclo_horario_estado_chk;
ALTER TABLE public.ciclo_horario ADD CONSTRAINT ciclo_horario_estado_chk CHECK (estado IN ('Activo', 'Inactivo'));

CREATE INDEX IF NOT EXISTS idx_ciclo_horario_estado ON public.ciclo_horario (estado);
