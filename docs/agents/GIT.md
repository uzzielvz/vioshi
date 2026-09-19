# Git con agentes

`main` es sagrado. El agente **nunca** pushea ni mergea `main`. Entrega un **PR**. Tú revisas.

## Forma correcta

```
origin/main  (solo tú mergeas PRs)
    ↑ PR
agent/L4-stores      worktree ../viogi-L4
agent/L5-admin-ops   worktree ../viogi-L5
agent/L1-shipping    worktree ../viogi-L1
```

Un agente = una rama = un worktree = un PR = un paquete.

## Qué hace el agente (en orden)

```bash
# 1. Su carpeta, no la de main
git fetch origin
git checkout -B agent/L4-stores origin/main

# 2. Codea. Un commit atómico. No `git add .` si hay archivos fuera del paquete.

# 3. Sube LA RAMA
git push -u origin HEAD

# 4. Abre PR contra main
gh pr create --base main --title "feat(stores): …" --body "Paquete: D-stores. Carril: L4."

# 5. PARA. No merge. No push a main. No borrar la rama.
```

Si `gh` no está autenticado: deja la rama pusheada y pega la URL. No improvises.

## Prohibido

- `git push origin main`
- `git checkout main` + commit ahí
- `--force` a `main` o a una rama que no creó él
- Mergear su propio PR
- Rebase interactivo (`-i`)
- Un PR que mezcle dos carriles

## Qué miras tú en el PR (2–4 min)

1. ¿El diff solo toca la lista del paquete?
2. ¿`checkout/actions.ts` y el webhook siguen vivos? (no vacíos)
3. ¿Checks: type-check + lint?
4. ¿Una migración, el número del paquete (`0016` / `0017`)?

Si sí: merge. Si tocó de más: pide revert de esos archivos, no rediseñes.

## Cuatro agentes hoy

Solo hay **3 paquetes LISTOS**. El cuarto no codea un cuarto carril.

| Agente | Modelo | Qué |
|---|---|---|
| 1 | Cursor Pro · fast | `D-stores` → PR |
| 2 | Cursor Pro · fast | `F-admin-ops` → PR |
| 3 | Cursor Pro · fast | `A1-shipping` → PR (`0017`) |
| 4 | Claude Pro | **Revisa** los 3 PRs. No escribe features |

Connect (L7) no es el cuarto. Inventar trabajo es cómo se rompe `main`.
