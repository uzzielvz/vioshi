# HOY — loop de ejecución

Tú no codeas features. Tú **eliges paquete, lanzas, mergeas**. Un chat = un paquete.

## Arranque (una vez, ahora)

1. Commit del OS (`docs/agents/`, `.cursor/rules/`, stubs). Sin esto los worktrees no ven el tablero.
2. `0015` ya está en prod (18 Sep). Pickup en vivo = red Valle de Toluca.

## Loop (cada feature)

```
1. Abres docs/agents/STATUS.md          → primer paquete LISTO
2. Nuevo chat / worktree / modelo barato
3. Pegas docs/agents/PROMPT.md
   y cambias packets/<este>.md
4. El agente toca SOLO esa lista
5. Tú: type-check + lint + diff de 2 min
6. Merge. STATUS gana una línea. Siguiente.
```

No pegues PLAN, auditoría ni el vault. Si el agente pregunta negocio de `OPEN.md`, respondes `BLOQUEO` o un número — no rediseñas.

## Paralelo de hoy (18 Sep)

| Chat | Paquete | ¿Choca? |
|---|---|---|
| A | `D-stores.md` (0016) | no |
| B | `F-admin-ops.md` | no, si no toca `lib/products.ts` |
| C | `A1-shipping.md` (0017) | no, si no usa 0016 |

L7 Connect: no. Nombre de plataforma: no. Fiscal: no.

## Tú, en paralelo (no es código)

- `0015` a prod
- Contador / Express MX (desbloquea L7 después)
- Drop 19 / cobranza (desbloquea **lanzar**, no programar)
