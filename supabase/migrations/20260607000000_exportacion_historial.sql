CREATE TABLE IF NOT EXISTS exportacion (
  id_exportacion     VARCHAR PRIMARY KEY,
  reporte_key        VARCHAR NOT NULL,
  reporte_label      VARCHAR NOT NULL,
  periodo            VARCHAR,
  formato            VARCHAR NOT NULL,
  fecha_creacion     TIMESTAMP NOT NULL,
  id_usuario         INTEGER REFERENCES usuario(id_usuario),
  usuario_nombre     VARCHAR,
  download_url       VARCHAR NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exportacion_fecha ON exportacion(fecha_creacion DESC);
