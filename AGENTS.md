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

**Siguiente trabajo:** paquete D (L4 stores). En paralelo posible: F (L5 admin). Connect (L7) bloqueado.

## Serializado

`middleware.ts` · `package.json` · `package-lock.json` · `.env*` · número de migración.

## DoD de cualquier carril

`npm run type-check` · `npm run lint` · un commit atómico · actualizar solo `STATUS.md`.

## Producto (resumen)

Plataforma ≠ tienda Viogi. Mario dentro de Viogi (`owner`). Comisión 0 %. IVA incluido. Stripe Checkout Sessions. Marca por env. Registro de vendedores cerrado.
