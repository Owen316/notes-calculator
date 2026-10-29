# Calculadora de notas

App web para que estudiantes calculen su nota final, sepan cuánto necesitan para ganar una
asignatura y simulen escenarios.

- **Nota final** a partir de: primer corte, segundo corte, TCC y examen final.
- **Cuánto necesito**: la nota mínima en lo que falta para ganar (o para una meta propia, p. ej. 4.0).
- **Simulador**: "¿y si saco 4.0 en el TCC?" → cuánto necesitas en el examen y en qué nota terminarías.
- **Parametrizable**: porcentajes (por defecto 20/20/20/40), nombres, cantidad de evaluaciones,
  escala y nota para ganar.
- Guarda los datos en el navegador del estudiante (no hay servidor ni cuentas).

## Desarrollo

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev        # servidor local en http://localhost:5173
npm test           # pruebas unitarias (Vitest)
npm run build      # verificación de tipos + build de producción en dist/
```

## Arquitectura

Arquitectura limpia organizada por módulos. Las dependencias apuntan siempre hacia adentro:
`presentation → application → domain`. El dominio no conoce React, el navegador ni el almacenamiento.

```
src/
├── modules/
│   └── grading/                  # Módulo de calificaciones (un "bounded context")
│       ├── domain/               # Reglas puras: entidades, cálculos y validaciones
│       │   ├── GradeScale.ts         escala (0–5, gana con 3.0)
│       │   ├── GradingScheme.ts      evaluaciones y porcentajes
│       │   ├── GradeRecord.ts        notas registradas (null = pendiente)
│       │   ├── gradeCalculator.ts    acumulado, nota final, rango alcanzable
│       │   ├── requirementCalculator.ts  nota necesaria para la meta
│       │   └── validation.ts         errores como códigos (sin textos de UI)
│       ├── application/          # Casos de uso y puertos
│       │   ├── ports/SessionRepository.ts   interfaz de persistencia
│       │   └── useCases/                    buildGradeReport, simulateScenario, SessionService
│       ├── infrastructure/       # Adaptadores: localStorage, memoria
│       ├── config/               # Esquema por defecto 20/20/20/40
│       └── index.ts              # API pública del módulo
├── presentation/                 # React: componentes, hook, formato y mensajes en español
└── app/
    ├── container.ts              # Raíz de composición (inyección de dependencias)
    └── App.tsx
```

### Cómo extenderla

- **Nueva regla de cálculo** (p. ej. redondeo a un decimal, nota mínima en el examen): función pura en
  `domain/`, con su prueba, y se expone en un caso de uso.
- **Guardar en la nube o con cuentas**: crear un adaptador que implemente `SessionRepository`
  (p. ej. `ApiSessionRepository`) y cambiarlo en `src/app/container.ts`. Nada más cambia.
- **Nueva funcionalidad** (p. ej. promedio del semestre / PAPA, horario): crear un módulo hermano en
  `src/modules/<nombre>/` con las mismas capas.

## Publicar en Vercel

Vite se detecta automáticamente; no hace falta configuración extra.

**Opción A — desde GitHub (recomendada):**
1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → *Add New… → Project* → importa el repositorio.
3. Vercel detecta *Vite* (build `npm run build`, salida `dist`). Pulsa *Deploy*.
4. Cada `git push` publica una nueva versión automáticamente.

**Opción B — desde la terminal:**
```bash
npm i -g vercel
vercel          # vista previa
vercel --prod   # producción
```

## Nota

Los cálculos no aplican redondeo y la nota requerida se redondea hacia arriba a dos decimales para no
quedarse corto. Cada profesor puede redondear la definitiva de forma distinta.
