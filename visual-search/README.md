# VIOGI — Visual Search

Módulo de búsqueda visual para [VIOGI](../), una tienda de streetwear.

El usuario sube una foto de una prenda o un outfit y el sistema recomienda
productos similares del catálogo, además de sugerencias de outfits completos.

---

## Opciones de implementación

**Opción A — Google Gemini API + Next.js (TypeScript)**
Un modelo de visión analiza la imagen y extrae atributos de la prenda.
Todo corre en el mismo proyecto, sin infraestructura adicional.

**Opción B — Python + CLIP (ML local)**
Modelo de embeddings que compara imágenes directamente por similitud visual.
Requiere un servidor Python independiente (FastAPI o Flask).
