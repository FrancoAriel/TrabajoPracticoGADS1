-- Eliminar 'Otro' del enum convenio_enum
-- NULL representa "sin convenio / no aplica"

-- 1. Pasar "Otro" a NULL en los datos existentes
UPDATE public.empleado SET convenio = NULL WHERE convenio = 'Otro';

-- 2. En Postgres no se puede DROP VALUE de un enum directamente.
--    Hay que recrear el tipo.

-- Quitar la columna del tipo actual
ALTER TABLE public.empleado ALTER COLUMN convenio TYPE VARCHAR;

-- Eliminar el enum viejo
DROP TYPE convenio_enum;

-- Crear el enum sin 'Otro'
CREATE TYPE convenio_enum AS ENUM (
  'Comercio (130/75)',
  'Metalúrgico (260/75)',
  'Gastronómico (389/04)',
  'Construcción (76/75)'
);

-- Volver a castear la columna
ALTER TABLE public.empleado
  ALTER COLUMN convenio TYPE convenio_enum
  USING convenio::convenio_enum;
