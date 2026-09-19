# AGENTS.md

Sistema operativo para agentes. **Empieza en [`docs/agents/README.md`](./docs/agents/README.md).**

## Lectura mínima

1. [`docs/agents/STATUS.md`](./docs/agents/STATUS.md)
2. [`docs/agents/FROZEN.md`](./docs/agents/FROZEN.md)
3. [`docs/agents/OPEN.md`](./docs/agents/OPEN.md)
4. El paquete en [`docs/agents/packets/`](./docs/agents/packets/)
5. [`docs/agents/lanes.md`](./docs/agents/lanes.md)

Plantilla para lanzar un modelo barato: [`docs/agents/PROMPT.md`](./docs/agents/PROMPT.md).

Negocio (cambia): Obsidian `70_Trabajo/Viogi` · playbook `Divide and Conquer.md`.

## Regla de oro

Un agente = un carril = archivos del paquete. Si dos tocan el mismo archivo, serie.

**Siguiente trabajo:** ninguno LISTO. Connect (L7) bloqueado hasta `OPEN.md` § Connect.

## Serializado

`middleware.ts` · `package.json` · `package-lock.json` · `.env*` · número de migración.

## Git

Rama `agent/L#-…` + PR a `main`. Nunca push/merge a `main`. Detalle: [`docs/agents/GIT.md`](./docs/agents/GIT.md).

## DoD de cualquier carril

`npm run type-check` · `npm run lint` · un commit en la rama del carril · `gh pr create --base main` · el humano mergea.

## Producto (resumen)

Plataforma ≠ tienda Viogi. Mario dentro de Viogi (`owner`). Comisión 0 %. IVA incluido. Stripe Checkout Sessions. Marca por env. Registro de vendedores cerrado.
