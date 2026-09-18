# Plantilla de prompt

Copia esto al lanzar un agente barato. Rellena el paquete. No pegues `PLAN.md`.

```
Carril: L# — <nombre>
Repo: C:\Users\uzzie\Documents\viogi-dot-comm
Lee EN ESTE ORDEN (y nada más de docs):
  1. docs/agents/STATUS.md
  2. docs/agents/FROZEN.md
  3. docs/agents/OPEN.md
  4. docs/agents/packets/<este>.md
  5. docs/agents/lanes.md

ARCHIVOS PERMITIDOS: los del paquete. Ningún otro.
ARCHIVOS PROHIBIDOS: middleware.ts, package.json, package-lock.json, .env*,
  migraciones ajenas, y todo lo que el paquete liste.

Reglas:
- No reabras decisiones de FROZEN.md.
- No inventes datos de OPEN.md. Si bloquea, anota BLOQUEO y para.
- No refactors de paso. No Next 16. No nuevas deps sin que el humano lo pida.
- Código/comentarios en inglés. Copy de UI en i18n (es + en).
- Ante doc vs código, gana el código.
- Al terminar: type-check + lint. Un commit atómico.
- Actualiza solo la tabla/fecha de docs/agents/STATUS.md.

Definition of Done: la del paquete.

Idioma de respuesta al humano: español.
```
