-- Horas diarias para empleados con jornada Parcial (contrato PRD: parcialHoras)
ALTER TABLE public.empleado
  ADD COLUMN IF NOT EXISTS horas_jornada_parcial NUMERIC(4,1);

COMMENT ON COLUMN public.empleado.horas_jornada_parcial IS 'Horas diarias contratadas cuando tipo_jornada = Parcial';

UPDATE public.empleado SET horas_jornada_parcial = 4
WHERE tipo_jornada = 'Parcial' AND horas_jornada_parcial IS NULL;
