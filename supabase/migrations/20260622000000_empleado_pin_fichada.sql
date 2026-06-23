-- PIN numérico para fichada por terminal (4–6 dígitos)
ALTER TABLE public.empleado
  ADD COLUMN IF NOT EXISTS pin_fichada VARCHAR(6);

COMMENT ON COLUMN public.empleado.pin_fichada IS 'PIN numérico para fichada por terminal (origen Pin)';

-- Empleados con modalidad Pin sin PIN: últimos 4 del DNI como valor inicial
UPDATE public.empleado
SET pin_fichada = RIGHT(REGEXP_REPLACE(dni, '\D', '', 'g'), 4)
WHERE modalidad_fichada = 'Pin'
  AND pin_fichada IS NULL
  AND LENGTH(REGEXP_REPLACE(dni, '\D', '', 'g')) >= 4;
