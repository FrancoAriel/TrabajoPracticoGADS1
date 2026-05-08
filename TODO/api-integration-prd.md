# PRD - Contrato Frontend/Backend

## Objetivo

Definir los endpoints, payloads, respuestas y reglas de integración necesarios para reemplazar todos los datos mock del frontend sin requerir cambios en las pantallas React.

## Regla de integración

El frontend debe poder funcionar en dos modos:

- `mock`: usa datos locales
- `api`: consume backend real

Variables de entorno:

```text
VITE_DATA_SOURCE=mock|api
VITE_API_BASE_URL=https://host/api
```

## Convenciones generales

- Formato JSON UTF-8
- Todas las fechas ISO 8601 en backend
- Frontend puede formatear a visual local
- Todas las respuestas exitosas: `200`, `201`, `204`
- Errores de validación: `400`
- No autenticado: `401`
- No autorizado: `403`
- No encontrado: `404`
- Error interno: `500`

## Envelope recomendado

Lectura:

```json
{
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

## 1. Auth

### POST `/auth/login`

Request:

```json
{
  "username": "admin",
  "password": "admin"
}
```

Response:

```json
{
  "data": {
    "token": "jwt-or-session-token",
    "user": {
      "id": "usr_1",
      "name": "Administrator",
      "role": "Super User",
      "initials": "AD"
    }
  }
}
```

## 2. Dashboard

### GET `/dashboard`

Response:

```json
{
  "data": {
    "heroMetrics": [
      { "key": "activeEmployees", "label": "Empleados activos", "value": 42 },
      { "key": "monthHours", "label": "Horas del mes", "value": "1240", "unit": "hs" },
      { "key": "pendingNews", "label": "Novedades pendientes", "value": 9 }
    ],
    "currentClosure": {
      "periodLabel": "Junio",
      "status": "BORRADOR"
    },
    "dailySummary": [
      { "key": "present", "label": "Presentes", "value": 34, "secondary": "/ 37" }
    ],
    "alerts": [
      {
        "id": "alert_1",
        "employeeId": "emp_42",
        "employeeName": "Juan Perez",
        "employeeLegajo": "0042",
        "status": "Tardanza 6 min",
        "severity": "error",
        "icon": "warning"
      }
    ],
    "periodStatus": {
      "period": "Junio 2025",
      "businessDaysElapsed": 9,
      "businessDaysTotal": 21,
      "progressPercent": 43,
      "he50": "42h 15m",
      "he100": "8h 00m",
      "unjustifiedAbsences": 3,
      "closureStatus": "draft"
    },
    "recentActivity": [],
    "pendingNewsTable": []
  }
}
```

## 3. Empleados

### GET `/employees`

Query params:

- `search`
- `category`
- `jornada`
- `status`
- `page`
- `pageSize`

Response:

```json
{
  "data": {
    "items": [
      {
        "id": "emp_42",
        "legajo": "0042",
        "name": "Juan Perez",
        "category": "Operario",
        "convenio": "UOM",
        "jornada": "Completa",
        "schedule": "Manana",
        "status": "Activo"
      }
    ],
    "stats": {
      "active": 42,
      "partial": 8,
      "outOfAgreement": 4,
      "newThisMonth": 3
    }
  },
  "meta": {
    "page": 1,
    "pageSize": 7,
    "totalItems": 42,
    "totalPages": 6
  }
}
```

### POST `/employees`

Request:

```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "dni": "12345678",
  "sexo": "M",
  "fechaIngreso": "2025-06-12",
  "categoria": "Operario",
  "convenio": "UOM",
  "jornada": "Completa",
  "parcialHoras": 4,
  "horario": "Manana",
  "fichada": "Biometrica"
}
```

Response:

```json
{
  "data": {
    "id": "emp_99",
    "legajo": "0099"
  }
}
```

### GET `/employees/:employeeId`

Response:

```json
{
  "data": {
    "employee": {
      "id": "emp_42",
      "legajo": "0042",
      "name": "Juan Perez",
      "status": "Activo",
      "category": "Operario",
      "convenio": "UOM"
    },
    "scheduleConfig": {
      "schedule": "Manana",
      "cycle": "Fijo semanal",
      "jornada": "Completa"
    },
    "periodSummary": {
      "workedDays": 9,
      "he50": "6h 15m",
      "he100": "1h 00m",
      "lateCount": 2,
      "absenceCount": 0,
      "pendingCount": 1
    },
    "weeklyGrid": [],
    "recentPunches": [],
    "recentNews": []
  }
}
```

### PATCH `/employees/:employeeId`

Actualiza datos editables del empleado.

### POST `/employees/:employeeId/assignments`

Request:

```json
{
  "type": "schedule",
  "targetId": "HOR-01"
}
```

### POST `/employees/:employeeId/news`

Carga novedad para empleado.

### POST `/employees/:employeeId/manual-punches`

Carga fichada manual del empleado.

## 4. Fichadas

### GET `/punches`

Query params:

- `search`
- `type`
- `origin`
- `status`
- `date`
- `page`
- `pageSize`

Response:

```json
{
  "data": {
    "stats": {
      "normal": 34,
      "late": 7,
      "double": 2,
      "absence": 3
    },
    "items": [
      {
        "id": "pun_1",
        "employeeId": "emp_42",
        "legajo": "0042",
        "employeeName": "Juan Perez",
        "timestamp": "2025-06-12T09:15:00Z",
        "type": "Entrada",
        "origin": "Biometrica",
        "correction": true,
        "status": "Tardanza"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 8,
    "totalItems": 30,
    "totalPages": 4
  }
}
```

### GET `/punches/:punchId`

Detalle de fichada con interpretación, horario teórico y trazabilidad.

### POST `/punches/manual`

Alta de fichada manual.

### POST `/punches/:punchId/corrections`

Alta de corrección sobre fichada.

### POST `/punches/reprocess`

Reprocesa fichadas del filtro actual o del día.

## 5. Horarios

### GET `/schedules/overview`

Response:

```json
{
  "data": {
    "stats": {
      "schedules": 3,
      "cycles": 2,
      "assignments": 12,
      "flexible": 1
    },
    "schedules": [
      {
        "id": "H-001",
        "name": "Planta Manana",
        "type": "Fijo",
        "status": "Activo",
        "startTime": "08:00",
        "endTime": "17:00",
        "entryToleranceMinutes": 5,
        "exitToleranceMinutes": 10,
        "breakMinutes": 60,
        "flexMode": null,
        "targetDailyHours": null,
        "targetWeeklyHours": null,
        "weeklyBreakdown": [
          { "day": "Lun", "start": "08:00", "end": "17:00" }
        ]
      }
    ],
    "cycles": [
      {
        "id": "C-001",
        "name": "4x2 Produccion",
        "days": 6,
        "status": "Activo",
        "mapping": [
          { "day": 1, "scheduleId": "H-001", "label": "H-001 · Manana" },
          { "day": 5, "scheduleId": null, "label": "Libre" }
        ]
      }
    ],
    "assignments": [
      {
        "id": "ASG-01",
        "legajo": "0042",
        "employeeId": "emp_42",
        "employeeName": "Juan Perez",
        "avatar": "JP",
        "type": "horario",
        "resourceLabel": "H-003 · Oficina Central",
        "fromDate": "2025-06-01",
        "toDate": null,
        "status": "activa"
      }
    ]
  }
}
```

Filtros y paginacion por tab (query params):

- `tab=horarios|ciclos|asignaciones`
- `search`
- `type`
- `status`
- `page`
- `pageSize`

### POST `/schedules`
### PATCH `/schedules/:scheduleId`
### POST `/cycles`
### PATCH `/cycles/:cycleId`
### POST `/assignments`
### PATCH `/assignments/:assignmentId`

## 6. Novedades

### GET `/news`

Query params:

- `search`
- `status`
- `type`
- `page`
- `pageSize`

Response:

```json
{
  "data": {
    "stats": {
      "pending": 9,
      "approved": 27,
      "rejected": 2,
      "automatic": 14
    },
    "items": [
      {
        "id": "NOV-101",
        "employeeId": "emp_42",
        "employee": "Juan Perez",
        "type": "Horas extra 50%",
        "date": "2025-06-12",
        "status": "Pendiente",
        "quantity": "1h 45m",
        "origin": "Automatica",
        "createdAt": "2025-06-12",
        "createdBy": "Sistema",
        "note": "Detectada por salida extendida."
      }
    ]
  }
}
```

### POST `/news`
### POST `/news/:newsId/approve`
### POST `/news/:newsId/reject`

Request reject:

```json
{
  "reason": "Motivo del rechazo"
}
```

## 7. Cierre mensual

### GET `/closures/current`

Response:

```json
{
  "data": {
    "currentPeriod": "Junio 2025",
    "stats": {
      "liquidated": 39,
      "pending": 3,
      "he50": "42h 15m",
      "he100": "8h 00m"
    },
    "periodCards": [],
    "employeeBreakdown": [],
    "checklist": []
  }
}
```

### POST `/closures/:periodId/run`

Ejecuta cierre si backend valida checklist completo.

## 8. Exportaciones

### GET `/exports/options`

Response con tarjetas/configuración disponible:

```json
{
  "data": {
    "stats": {
      "today": 12,
      "csv": 5,
      "pdf": 4,
      "xlsx": 3
    },
    "reports": [
      {
        "key": "punches",
        "label": "Fichadas",
        "periodOptions": ["Junio 2025", "Mayo 2025"],
        "formatOptions": ["CSV", "PDF", "XLSX"]
      }
    ],
    "history": []
  }
}
```

### POST `/exports`

Request:

```json
{
  "reportKey": "punches",
  "period": "Junio 2025",
  "format": "CSV"
}
```

Response:

```json
{
  "data": {
    "exportId": "exp_1",
    "downloadUrl": "https://host/files/exp_1.csv"
  }
}
```

### GET `/exports/:exportId/download`

## 9. Diccionarios y catálogos sugeridos

Para evitar hardcodear opciones en frontend:

### GET `/catalogs`

Debe incluir:

- categorías de empleado
- convenios
- jornadas
- horarios
- tipos de fichada
- tipos de novedad
- estados de novedad
- formatos de exportación

## 10. Requisitos backend para no tocar frontend

Backend debe garantizar:

1. naming consistente con este PRD
2. campos presentes aunque el valor sea `null`
3. ids estables para navegación y acciones
4. listas paginadas donde frontend ya espera paginación
5. respuestas suficientes para renderizar cards, tablas y modales sin requests extra innecesarios
6. compatibilidad con CORS para origen del frontend
7. fechas ISO estándar
8. mensajes de error legibles en `error.message`

## 11. Estrategia de adopción

1. backend implementa endpoints anteriores
2. frontend cambia `VITE_DATA_SOURCE=api`
3. frontend apunta `VITE_API_BASE_URL`
4. si los contratos coinciden, no hacen falta cambios de UI
