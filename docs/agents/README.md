# OS de agentes — cómo trabajar este repo

Este directorio es lo único que un agente nuevo debe leer **antes** de tocar código.

El negocio (nombre de la plataforma, comisión futura, acuerdos con Mario, caja) vive en el vault de Obsidian. **No se inventa aquí.** Si un dato de negocio no está en `FROZEN.md`, no lo asumas: márcalo y sigue con lo que sí es código.

## Orden de lectura (máximo 4 archivos)

1. [`STATUS.md`](./STATUS.md) — qué existe hoy, qué falta, qué está roto
2. [`FROZEN.md`](./FROZEN.md) — decisiones que no se reabren
3. [`OPEN.md`](./OPEN.md) — lo que el humano todavía decide
4. El **paquete** de tu carril en [`packets/`](./packets/)

Luego: [`lanes.md`](./lanes.md) + [`PROMPT.md`](./PROMPT.md) + [`GIT.md`](./GIT.md).

Auditor (Opus / Claude Code): [`AUDITOR.md`](./AUDITOR.md).

Mapa de carpetas: [`MAP.md`](./MAP.md).

**Un dato, un archivo.** `STATUS.md` es el **único** que describe estado del código: si otro doc
cuenta qué se mergeó, en dos semanas se contradicen. `FROZEN.md` y `OPEN.md` aguantan porque guardan
decisiones, no estado. El histórico de sesiones vive en `sessions.md` (raíz del repo), no aquí.
Paquetes ya mergeados: `packets/_done/`.

## Qué no leer

No uses como verdad actual:

- `PLAN.md`, `CONTEXT.md`, `RESEARCH-CONSOLIDADO.md` (stubs; el cuerpo viejo está en `docs/archive/`)
- `AUDITORIA-PRE-LANZAMIENTO.md` (foto del 31 ago 2026; varios bloqueantes ya se cerraron)
- `TESTING-PLAN.md` (describe Vitest/Playwright que **no** están en `package.json`)
- `docs/archive/**`
- Notas de Obsidian `Viogi e commerce.md` (cuerpo de mayo; desfasado)

Si un doc y el código discrepan, **gana el código**. Actualiza solo `STATUS.md` al cerrar un paquete.

## Modelos

- Un modelo caro (esta sesión) dejó el tablero. Los siguientes agentes deben ser **baratos y acotados**.
- Un agente = un paquete = un carril = una lista de archivos. Sin refactors de paso.
