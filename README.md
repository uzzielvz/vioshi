# VIOGI


---

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- next-intl (es / en)
- Context API + localStorage

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build
npm run lint         # Linter
npm run type-check   # TypeScript
```

## Estructura

```
app/[locale]/        # Rutas localizadas (es, en)
components/          # Componentes UI
store/               # Estado del carrito (Context API)
lib/                 # Productos, utilidades, constantes
messages/            # Traducciones (en.json, es.json)
types/               # Tipos TypeScript
visual-search/       # Módulo de búsqueda visual (en desarrollo)
```

## Módulos

- Catálogo de productos con filtrado por categoría
- Carrito con persistencia en localStorage
- Checkout con envío a domicilio y puntos de entrega
- Cuentas de usuario
- Soporte, guía de tallas, envíos y devoluciones
- Búsqueda visual por imagen — clasificación CNN de prendas

---

## Módulo de búsqueda visual

La ruta `/[locale]/visual-search` permite subir una foto de una prenda y obtener su categoría predicha (playera, pantalon, sudadera, calzado) junto con la distribución de probabilidades por clase.

### Arquitectura

```
Navegador → POST /api/classify (Next.js) → POST /classify (FastAPI Python)
                                              ↓
                                     preprocess.py (OpenCV)
                                              ↓
                                     model/model.h5 (TensorFlow/Keras CNN)
```

### Levantar el servicio de inferencia con Docker

```bash
# Desde la raíz del proyecto
cd inference

# Construir imagen
docker build -t viogi-inference .

# Ejecutar con modelo placeholder (pesos aleatorios)
docker run -p 8000:8000 viogi-inference

# Ejecutar con el modelo real entrenado (montar el archivo .h5)
docker run -p 8000:8000 \
  -v /ruta/al/model.h5:/app/model/model.h5 \
  -e MODEL_PATH=/app/model/model.h5 \
  viogi-inference
```

El servicio queda disponible en `http://localhost:8000`.  
Endpoint de salud: `GET http://localhost:8000/health`

### Conectar con el proyecto Next.js

En `.env.local` asegúrate de tener:

```env
INFERENCE_SERVICE_URL=http://localhost:8000
```

Luego inicia el servidor de desarrollo normalmente:

```bash
npm run dev
```

Navega a `http://localhost:3000/es/visual-search` para probar la UI.

### Umbral de baja confianza

Si la diferencia entre las dos clases más probables es menor a **0.15**, el sistema devuelve `low_confidence: true` y la UI muestra un mensaje pidiendo una nueva imagen con mejores condiciones (fondo neutro, prenda completamente visible).

Este umbral es configurable con la variable de entorno `LOW_CONFIDENCE_THRESHOLD` en el servicio Python.

### Sustitución del modelo

El repositorio incluye un modelo CNN de placeholder (pesos aleatorios) con la arquitectura correcta:

- 3 bloques Conv2D (32, 64, 128 filtros) + MaxPooling
- Flatten → Dense 128 ReLU + Dropout 0.5
- Dense 4 softmax (playera, pantalon, sudadera, calzado)
- Entrada: `(224, 224, 3)`

Para sustituirlo por el modelo entrenado real, coloca el archivo `model.h5` en `inference/model/` o monta el volumen Docker como se indica arriba.

---

Instagram: [@viogi_](https://www.instagram.com/viogi_/)
