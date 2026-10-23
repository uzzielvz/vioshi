# Tokens de diseño — rail

> Diseño aprobado el 2026-10-23: [`prototipo-rail.html`](./prototipo-rail.html) (ábrelo en el
> navegador; las 14 pantallas son la referencia). Este archivo guarda los valores para pasarlos a
> `tailwind.config.ts` en la **Etapa 2** (`docs/PROYECTO.md` § 6).
>
> Historia: la versión del 2026-10-14 copiaba el tratamiento visual de Grailed (azul `#0000FF`,
> Kode Mono, Oswald, botones píldora) y se descartó porque se veía como copia. Después se probaron
> y descartaron la cinta métrica, las medidas en la tarjeta de la feed, las etiquetas colgantes y
> los avisos con cuadritos. De Grailed solo se queda la **estructura** (feed de 2 columnas, seguir,
> panel de vendedor).

## Marca

- Nombre de plataforma: **rail**, en minúsculas. Sale de `lib/brand.ts` (`NEXT_PUBLIC_BRAND_NAME`).
- Logo: «rail» en Inter 800, tracking −0.05em, corte display (`opsz` 32). La i se escribe sin punto
  (`ı`, U+0131) y el punto se dibuja aparte en azul `accent` (círculo de 0.18em, a 0.09em del tope
  de la caja de línea). Ver `.wm` en el prototipo.
- Las tiendas (Viogi) tienen su propio logo y portada. No se mezclan con la marca de la plataforma.

## Color

Base blanca con tinta casi negra. El azul es el único color de acción.

| Token | Valor | Uso |
|---|---|---|
| `accent` | `#1F2BFF` | Botón principal, «Seguir», links, corazón guardado, aro de historias con piezas nuevas, punto del logo |
| `accent-press` | `#1620D6` | Hover y presionado del azul |
| `accent-wash` | `#F1F2FF` | Fondo de avisos sin leer en Actividad |
| `ink` | `#111111` | Texto, pestaña activa, botón de contorno, logo de tienda, badge «Vendida» |
| `paper` | `#FFFFFF` | Fondo |
| `carton` | `#F3F2EE` | Fondo de foto mientras carga, botón suave, avatar sin foto, caja de resumen, notas |
| `line` | `#E4E2DC` | Divisores, bordes de campos y filtros |
| `muted` | `#6B6B66` | Texto secundario, pestañas inactivas, «Siguiendo» (ya seguido) |

Contraste: blanco sobre `accent` 7.4:1; `muted` sobre blanco 5.4:1. No se usa verde por ahora.

## Letra

**Inter** en todo, cargada con `next/font/google` (`axes: ['opsz']`). Sin mono, sin condensadas.

| Elemento | Tamaño | Peso | Notas |
|---|---|---|---|
| Título de pantalla («Siguiendo», «Bolsa») | 20 px | 700 | tracking −0.015em |
| Título de prenda / perfil | 20–22 px | 700 | `text-wrap: balance` |
| Precio grande (prenda) | 24 px | 700 | `tabular-nums` |
| Título de sección («Lo nuevo de lo que sigues») | 17 px | 700 | |
| Cuerpo | 13–14 px | 400 | interlineado 1.45 |
| Tarjeta: marca + tipo | 13 px | 600 + 400 | una línea con «…» |
| Tarjeta: talla | 13 px | 500 | a la derecha, texto simple |
| Tarjeta: precio | 13 px | 700 | `tabular-nums` |
| Pestañas | 13 px | 500 / 600 activa | |
| Botones | 14 px | 600 | tipo oración, nunca mayúsculas espaciadas |
| Etiqueta de sección («ENTREGA», «ESTE MES») | 11–12 px | 600 | mayúsculas, tracking 0.1em, `muted` |
| Barra inferior | 10 px | 500 / 600 activa | |

## Componentes

- **Botón:** rectángulo de 48 px de alto, radio 3 px. Variantes: azul (`accent`), contorno (`ink`)
  y suave (`carton`). Uno azul por pantalla como máximo.
- **Seguir:** botón azul chico de 30 px («Seguir»). Ya seguido: texto `muted` con palomita, sin caja.
- **Pestañas:** texto; la activa en `ink`, 600 y subrayado de 2 px. Sin píldoras ni puntos.
- **Filtros (búsqueda):** caja de 32 px con borde `line` y flechita; el filtro activo con borde `ink`.
- **Badge de estado sobre la foto:** «Apartada» (blanco, borde `ink`) y «Vendida» (`ink` con texto
  blanco), 10 px, mayúsculas. Se ven distintos a propósito. La foto vendida va en gris.
- **Avatar:** tienda = cuadrado (radio 4 px, fondo `ink`); persona y marca = redondo; búsqueda =
  redondo con lupa.
- **Historias (inicio):** círculos de 60 px. Aro azul de 2 px si hay piezas nuevas; gris si no;
  punteado si es una búsqueda.
- **Tarjeta de la feed:** foto 3:4 sobre `carton` (las fotos de fondo blanco se mezclan en
  multiplicar), marca + tipo y talla, precio y corazón. **Nada más**: sin medidas ni estado.
- **Grid de la feed:** 2 columnas en móvil, de borde a borde, 2 px entre columnas y 22 px entre filas.
- **Perfil de tienda:** portada 16:7, logo cuadrado de 68 px montado sobre la portada, nombre,
  ciudad, «seguidores · vendidas», bio, «Seguir» + Instagram, pestañas «En venta · Vendidas ·
  Información» y la misma feed de tarjetas (no la cuadrícula de Instagram).
- **Mi tienda:** la misma portada con el botón «Cambiar portada».
- **Barra inferior:** Inicio · Siguiendo · Vender · Bolsa · Perfil.
- **Avisos:** filas de texto simple. Sin cuadritos ni filetes de color a la izquierda.

## Pendiente

- [ ] Versión de escritorio de inicio, prenda, tienda y pagar.
- [ ] Pasar estos tokens a `tailwind.config.ts` (Etapa 2).
