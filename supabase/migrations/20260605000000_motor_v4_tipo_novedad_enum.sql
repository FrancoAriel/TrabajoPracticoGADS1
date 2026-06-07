-- Motor V4: valores emitidos por el backend para las nuevas reglas y la
-- convención PascalCase con underscores usada por la API.

ALTER TYPE tipo_novedad_enum ADD VALUE IF NOT EXISTS 'Salida_Anticipada';
ALTER TYPE tipo_novedad_enum ADD VALUE IF NOT EXISTS 'Horas_Extra_50';
ALTER TYPE tipo_novedad_enum ADD VALUE IF NOT EXISTS 'Horas_Extra_100';
ALTER TYPE tipo_novedad_enum ADD VALUE IF NOT EXISTS 'Doble_Fichada';
ALTER TYPE tipo_novedad_enum ADD VALUE IF NOT EXISTS 'Descanso_No_Tomado';
ALTER TYPE tipo_novedad_enum ADD VALUE IF NOT EXISTS 'Descanso_Excedido';
