-- Modalidad habitual de fichada por empleado (mismo dominio que origen_fichada en cada registro de fichada)
ALTER TABLE public.empleado
  ADD COLUMN IF NOT EXISTS modalidad_fichada origen_fichada_enum;

COMMENT ON COLUMN public.empleado.modalidad_fichada IS 'Medio habitual configurado para las fichadas del empleado';

UPDATE public.empleado SET modalidad_fichada = 'Biometrico' WHERE modalidad_fichada IS NULL;
