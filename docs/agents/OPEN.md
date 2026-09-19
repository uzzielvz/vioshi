# Abierto — lo decide el humano, no el agente

Si tu paquete depende de una fila ⏳, **no inventes el valor**. Deja un setting editable o un `TODO` y sigue.

## Negocio (vault · cambia con el tiempo)

| Tema | Estado | ¿Bloquea código? |
|---|---|---|
| Nombre de la plataforma (dominio + IG + IMPI) | ⏳ | No. Ya es env (`NEXT_PUBLIC_BRAND_*`) |
| Consulta fiscal / retenciones / estructura legal | ⏳ Mario | **Sí para Connect (L7)** |
| Hoja de sociedad (quién decide qué) | ⏳ | No para tienda; sí antes de vendedores externos |
| % que le toca a Mario por prenda suya | ⏳ | No. `owner` basta hasta Connect |
| Comisión a vendedores externos (8–10 %) | ⏳ futuro | No. Fase 1 = 0 % |
| Dueño del contenido / dos Instagram | ⏳ | No es código |
| Drop 19 fotografiado / cobranza $1,480 | ⏳ Uzziel | No es código; bloquea **lanzar**, no programar |
| Datos huecos de pickup (Almoloya, Tianguistenco, Maps Tenancingo) | ⏳ Mario | No. Seed se edita en admin/DB |
| Precio real de envío a domicilio / Skydropx | ⏳ | Código: setting editable. No hardcodear un precio “correcto” |
| Stripe live vs test en prod | ⏳ ops | No es un PR de feature |
| ¿Express Connect disponible + KYC persona física en MX? | ⏳ verificar | **Sí para L7** |

## No está definido (no lo “resuelvas”)

- Quién tiene la última palabra sobre precios, compra, contenido y web.
- Inventario conjunto Uzziel + Mario.
- Política si el cliente no recoge en 30 días.
- Canal para mover inventario parado (Marketplace / WhatsApp / paca).

## Puertas de producto (no son fechas)

De `Plataforma_MVP`:

- **Fase 1 piloto:** una tienda visible (Viogi), Mario dentro, ≥ 40 % ventas web, ≥ 20 pedidos, Mario diría sí al 8 %.
- **Fase 2:** 3 tiendas externas, registro sigue por aprobación.
- **Fase 3:** abrir. Aquí sí reviews, comisión automática, Skydropx.

Un agente no “adelanta Fase 3” porque el código sea fácil.

## Cómo anotar un bloqueo

En el PR o al final del turno:

```
BLOQUEO: necesito <dato> de <quién>. No lo inventé. Dejé <setting/TODO>.
```
