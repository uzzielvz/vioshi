# Archivo histórico — Viogi

Documentación **obsoleta** conservada como registro. No usar para desarrollo activo.

## Documentos vivos (usar estos)

| Documento | Ubicación | Propósito |
|-----------|-----------|-----------|
| Research SSOT | [`../../RESEARCH-CONSOLIDADO.md`](../../RESEARCH-CONSOLIDADO.md) | Hechos técnicos verificados |
| Roadmap | [`../../PLAN.md`](../../PLAN.md) | Backlog y fases del proyecto |
| Mapa rápido | [`../../CONTEXT.md`](../../CONTEXT.md) | Estructura del repo |
| Guía agentes | [`../../CLAUDE.md`](../../CLAUDE.md) | Convenciones de código |

---

## Índice de archivos archivados

| Archivo | Fecha | Descripción | Estado al archivar |
|---------|-------|-------------|-------------------|
| [`RESEARCH-2026-05-13.md`](./RESEARCH-2026-05-13.md) | 2026-05-13 | Research exhaustivo pre–visual search | Reemplazado por `RESEARCH-CONSOLIDADO.md` |
| [`plan-auth.md`](./plan-auth.md) | 2026-05-03 | Plan módulo autenticación Supabase (AU-01..AU-07) | **Completado** — módulo auth cerrado |
| [`plancheckout.md`](./plancheckout.md) | 2026-03-17 | Plan checkout UX + auditoría | **Pendiente** — checkout sigue mock; ver `PLAN.md` Fase 2 |

---

## Ramas Git archivadas

| Tag | Commit | Descripción |
|-----|--------|-------------|
| `archive/feat-visual-search-fastapi` | `dd349ef` | Rama legacy `feat/visual-search` (FastAPI + CLIP). Descartada en favor de Gemini en `main`. Rama remota eliminada CLN-06 (2026-05-19). |

**Rama canónica actual:** `main` (visual search vía `feat/visual-search-gemini`, ya mergeada).

---

## Regla

Ante contradicción entre estos archivos y el código (o `RESEARCH-CONSOLIDADO.md`), **gana el código**. Luego actualiza la documentación viva.
