-- ============================================================
-- Habilitar RLS en todas las tablas públicas
-- El acceso se realiza exclusivamente desde el backend
-- usando la service_role key, que bypasea RLS.
-- No se crean políticas permisivas para anon/authenticated
-- porque la autenticación es propia (tabla usuario).
-- ============================================================

ALTER TABLE empleado              ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario               ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario_dia           ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario               ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignacion_horario    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclo_horario         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciclo_horario_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado_ciclo        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichada               ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedad               ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierre_mensual        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierre_mensual_detalle ENABLE ROW LEVEL SECURITY;
