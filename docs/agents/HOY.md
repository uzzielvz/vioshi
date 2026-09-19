# HOY — loop de ejecución

Tú no codeas features. Tú **eliges paquete, lanzas, revisas el PR, mergeas**. Un chat = un paquete = una rama. `main` no se toca.

## Arranque (una vez, ahora)

1. Commit del OS (`docs/agents/`, `.cursor/rules/`, stubs). Sin esto los worktrees no ven el tablero.
2. `0015` ya está en prod (18 Sep). Pickup en vivo = red Valle de Toluca.

## Loop (cada feature)

```
1. Abres docs/agents/STATUS.md          → primer paquete LISTO
2. Worktree + rama agent/L#-…
3. Chat barato: pegas PROMPT.md + el paquete
4. El agente codea, commitea en SU rama, abre PR, PARA
5. Tú (o Claude Pro): revisas el PR vs la lista del paquete
6. Merge a main. Siguiente.
```

Git: [`GIT.md`](./GIT.md). Sin push a `main`.

No pegues PLAN, auditoría ni el vault. Si el agente pregunta negocio de `OPEN.md`, respondes `BLOQUEO` o un número — no rediseñas.

## Paralelo de hoy (18 Sep)

| Chat | Modelo | Paquete | ¿Choca? |
|---|---|---|---|
| A | Cursor fast | `D-stores.md` (0016) → PR | no |
| B | Cursor fast | `F-admin-ops.md` → PR | no, si no toca `lib/products.ts` |
| C | Cursor fast | `A1-shipping.md` (0017) → PR | no, si no usa 0016 |
| D | Claude Pro | **revisa A–C** | no codea |

L7 Connect: no. Nombre de plataforma: no. Fiscal: no.

## Tú, en paralelo (no es código)

- `0015` a prod
- Contador / Express MX (desbloquea L7 después)
- Drop 19 / cobranza (desbloquea **lanzar**, no programar)
