# Tokens de diseño — referencia Grailed

> Valores para la **Etapa 2** (`docs/PROYECTO.md` § 6). Investigado el 2026-10-14.
>
> **Ningún valor viene del CSS de Grailed**: grailed.com está bloqueado desde el entorno de los
> agentes. Los colores y las medidas salen de muestrear píxeles de:
> - las capturas de `referencias/`, que son de la app iOS;
> - una captura de escritorio de grailed.com de 2025, de un dataset público.
>
> La identificación de fuentes sale del índice público de `fonts.grailed.com` y de comparar glyphs
> contra más de 60 fuentes libres.
>
> Confianza: **probable** = medición sólida · **aprox.** = medición con ruido (texto chico,
> líneas de 1 px). Antes de pasar estos valores a `tailwind.config.ts` hay que hacer la prueba
> visual y que el humano la apruebe.

## Cómo sacar los valores exactos (5 min, en tu computadora)

1. Abre grailed.com en Chrome de escritorio y luego DevTools (`Cmd+Opt+I`).
2. **Network → filtro "Font" → recarga.** Los nombres de los `.woff2` dan las familias reales,
   sobre todo la de botones, que todavía no está identificada.
3. **Elements:** selecciona el botón "Sign up", un título de prenda, un precio y un encabezado.
   En **Computed** copia `font-family`, `font-size`, `font-weight`, `letter-spacing`,
   `line-height`, `border-radius`, `height` y `background-color`.
4. **Styles de `<html>` / `:root`:** copia las variables `--color-*` y `--font-*` si existen.
5. Copia el color calculado del texto verde de "free shipping".

Pega los valores en el chat o en este archivo y se reemplazan los aproximados.

---

## Color

Base B/N. Azul para la acción principal. Verde solo para casos muy puntuales (FROZEN 2026-10-14).

| Token | Valor | Uso | Confianza |
|---|---|---|---|
| `accent` | `#0000FF` | CTA principal (píldora sólida) y links. Texto blanco encima (contraste 8.6:1) | probable (`#0000FE` en ~5,700 px) |
| `on-accent` | `#FFFFFF` | Texto sobre azul | probable |
| `promo` | `#1B7A5E` | **Solo** promos y confirmaciones (texto chico en mayúsculas). Rango medido `#1B7A5E`–`#217F63` | aprox. |
| `promo-bg` | `#F4F8F7` | Franja de fondo detrás del texto verde | probable |
| `ink` | `#000000` | Texto, logo, botones negros, pestaña activa | probable |
| `bg` | `#FFFFFF` | Fondo de página y de botones contorno | probable |
| `surface` | `#FAFAFA` | Tarjetas de aviso, sin borde | probable |
| `placeholder` | `#F7F7F7` | Fondo de la foto mientras carga | probable |
| `chip` | `#F5F5F5` | Pestañas y filtros inactivos | probable |
| `border` | `#E1E1E1` | Líneas finas, divisores, bordes de botón claro | probable |
| `border-strong` | `#B3B3B3` | Borde de la píldora secundaria (medido entre `#B3B3B3` y `#CCCCCC`) | aprox. |
| `text-muted` | `#737373` | Texto secundario y placeholders (contraste 4.7:1) | probable |
| `text-faint` | `#B3B3B3` | Solo decorativo: contraste 2.1:1, no pasa WCAG para texto | probable |
| `alert` | `#BB2928` | Punto de notificación | aprox. |

**Descartados:**
- `#4A9ADE`, `#0E2252` y `#B3833F`: paleta de Brandfetch, vieja y no reclamada; no aparece en la UI.
- `#3B5998`: el azul de Facebook en su botón de login.

## Tipografía

Las fuentes de Grailed son **comerciales o no identificadas**. No se copian ni se auto-hospedan
(FROZEN). Se usan equivalentes libres (OFL) que se cargan con `next/font/google` y existen en
`next@14.2.35`.

| Rol | Grailed (lo que se sabe) | Equivalente libre | Pesos |
|---|---|---|---|
| **Texto, títulos, nav, precio** | Web: sans tipo sistema/SF, sin confirmar. iOS: parece SF Pro. Hay archivos de Neue Haas Grotesk en `fonts.grailed.com` (2022), pero las proporciones medidas **no** son las de NHG | **Inter**, con eje `opsz`, que activa el corte Display en tamaños grandes | 400, 500, 600, 700 |
| **Botones, pestañas, chips, etiquetas** (mayúsculas cuadradas) | **No identificada**; probablemente propia. Rasgos: V de lados rectos, W de base plana, O rectangular redondeada | **Kode Mono** (mejor de 65 fuentes comparadas). Alternativa: **Tektur**, que es proporcional | 700 (600–700 en CTA grande) |
| **Logotipo** (solo el nombre de la tienda o plataforma) | Wordmark GRAILED: grotesca condensada pesada con mucho tracking, diseño propio y marca registrada | **Oswald 700**, la más cercana medida. O **Bebas Neue**, la que ya usa la tienda (~18 % más angosta) | 700 / 400 |

**Helvetica Neue:** la tienda hoy usa `'Helvetica Neue', 'Inter', …`, así que en Mac y iPhone se
ve Helvetica y en lo demás Inter. Lo medido de Grailed queda **más cerca de Inter**: proporción
altura-x/mayúscula ~0.77 contra 0.75 de Inter y ~0.72 de Helvetica/NHG. **Recomendación:** Inter
primero en todos lados, para que haya un solo look. Si se prefiere Helvetica en Apple, se acepta
la diferencia. **(humano)**

### Escala propuesta

| Elemento | Fuente | Tamaño / interlineado | Peso | Tracking | Caja |
|---|---|---|---|---|---|
| Título hero | Inter | 34 px / 1.15 | 700 | −0.01em | Oración |
| Título de sección ("Lo nuevo") | Inter | 15 px / 1.15 | 700 | +0.04em (Grailed) o 0 (más apretado) | Oración |
| Nav de categorías | Inter | 12 px / 1 | 600 | +0.04em | MAYÚSCULAS |
| Cuerpo | Inter | 14 px / 1.45 | 400 | 0 | Oración |
| Tarjeta: marca · talla | Inter | 13 px | 400 | 0 | Una línea con «…»; talla a la derecha |
| Tarjeta: precio | Inter | 13–14 px | 700 | 0 | `tabular-nums` |
| Botón, pestaña, chip, etiqueta | Kode Mono | 11 px / 1 | 700 | 0.05em si es una palabra; 0–0.02em si son varias | MAYÚSCULAS |
| Etiqueta en CTA píldora (móvil) | Kode Mono | 12 px / 1 | 700 | igual que arriba | MAYÚSCULAS |
| CTA grande | Kode Mono | 18 px / 1 | 600–700 | 0–0.02em | MAYÚSCULAS |
| Logotipo | Oswald / Bebas | según diseño | 700 / 400 | 0.10–0.12em | MAYÚSCULAS |

Kode Mono es monoespaciada: los espacios y las comas salen más anchos que en Grailed. Conviene
etiquetas cortas. Si en la prueba se notan los huecos, se prueba Tektur.

## Formas y layout

- **CTA en móvil:** píldora completa (`rounded-full`), ~44 px de alto, ancho completo con ~20 px
  de margen. La primaria es azul; la secundaria es blanca con borde `border-strong`.
- **Botones chicos** (Seguir, Agregar): rectángulo **sin redondear**, contorno de 1 px o negro sólido.
- **Pestañas:** chips píldora. La activa es `ink` con texto blanco; las inactivas, `chip` con texto `ink`.
- **Escritorio:** grailed.com usa **esquinas rectas** en botones (captura de 2025). La diferencia
  píldora/recto es de plataforma, no de época. Decidir por componente en la prueba visual.
- **Feed:** 2 columnas en móvil, de borde a borde y sin margen exterior. Separación de 2–4 px.
  Foto cuadrada sin borde, radio ni sombra, con fondo `placeholder` mientras carga.

## Licencias

- Inter, Kode Mono, Tektur, Oswald y Bebas Neue: SIL OFL. Se pueden auto-hospedar con `next/font`.
- Neue Haas Grotesk, Proxima Nova, Neue Haas Unica, Noe Display y Function Pro: comerciales. SF Pro
  solo se permite en UI de plataformas Apple.
- El logotipo propio **no** imita letra por letra el wordmark de Grailed. Solo se adopta el género
  (condensada pesada con tracking amplio).

## Pendiente

- [ ] Confirmar con DevTools: la fuente de botones, el verde, el borde de la píldora secundaria y los tamaños reales.
- [ ] **(humano)** Inter primero o Helvetica Neue primero.
- [ ] **(humano)** Logotipo: Oswald (más Grailed) o Bebas Neue (el actual).
- [ ] Prueba visual (tarjeta del feed, CTA, pestañas, título, nav) aprobada por el humano. Después,
  los tokens pasan a `tailwind.config.ts`.
