import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[56px]">
        <div className="px-8 py-12 md:px-32 max-w-6xl">
          {/* Título solo visible en móvil */}
          <h1 
            className="md:hidden mb-8 uppercase"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            Accesibilidad
          </h1>

          <div 
            className="space-y-12"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif"
            }}
          >
            <section>
              <h2 
                className="text-2xl font-bold mb-6 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Compromiso con la accesibilidad
              </h2>
              <p className="text-base leading-relaxed mb-4">
                En VIOGI estamos comprometidos a garantizar la accesibilidad digital para personas con discapacidades. 
                Continuamente mejoramos la experiencia del usuario para todos y aplicamos los estándares de accesibilidad 
                relevantes.
              </p>
            </section>

            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Estándares de conformidad
              </h3>
              <p className="text-gray-700 mb-4">
                Nuestro objetivo es cumplir con las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1 nivel AA. 
                Estas pautas explican cómo hacer el contenido web más accesible para personas con discapacidades y también 
                hacen que el contenido web sea más usable para todos los usuarios.
              </p>
            </section>

            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Medidas para apoyar la accesibilidad
              </h3>
              <p className="text-gray-700 mb-4">
                VIOGI toma las siguientes medidas para garantizar la accesibilidad de nuestro sitio web:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Incluir la accesibilidad como parte de nuestra misión</li>
                <li>Integrar la accesibilidad en nuestras políticas internas</li>
                <li>Asignar objetivos y responsabilidades claras de accesibilidad</li>
                <li>Garantizar que nuestros desarrolladores estén capacitados en accesibilidad</li>
                <li>Incluir personas con discapacidades en nuestro diseño y pruebas de usuario</li>
                <li>Auditar regularmente nuestro sitio para problemas de accesibilidad</li>
              </ul>
            </section>

            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Características de accesibilidad
              </h3>
              <p className="text-gray-700 mb-4">
                Nuestro sitio web incluye las siguientes características de accesibilidad:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Texto alternativo para imágenes</li>
                <li>Encabezados estructurados para facilitar la navegación</li>
                <li>Enlaces descriptivos que tienen sentido fuera de contexto</li>
                <li>Suficiente contraste de color entre texto y fondo</li>
                <li>Formularios con etiquetas claras y mensajes de error</li>
                <li>Navegación por teclado</li>
                <li>Diseño responsive que funciona en diferentes dispositivos</li>
                <li>Compatibilidad con lectores de pantalla</li>
              </ul>
            </section>

            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Tecnologías compatibles
              </h3>
              <p className="text-gray-700 mb-4">
                La accesibilidad de nuestro sitio web se basa en las siguientes tecnologías para funcionar:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>HTML5</li>
                <li>CSS3</li>
                <li>JavaScript</li>
                <li>ARIA (Accessible Rich Internet Applications)</li>
              </ul>
            </section>

            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Limitaciones conocidas
              </h3>
              <p className="text-gray-700 mb-4">
                A pesar de nuestros mejores esfuerzos, algunas páginas o contenidos de nuestro sitio web 
                pueden no estar completamente accesibles todavía. Estamos trabajando activamente para mejorar 
                estas áreas:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Algunos PDF antiguos pueden no ser completamente accesibles</li>
                <li>Algunos videos pueden no tener subtítulos completos</li>
                <li>Algunas imágenes de productos de terceros pueden carecer de texto alternativo adecuado</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Estamos comprometidos a abordar estas limitaciones en futuras actualizaciones.
              </p>
            </section>

            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Retroalimentación
              </h3>
              <p className="text-gray-700 mb-4">
                Agradecemos tus comentarios sobre la accesibilidad de nuestro sitio web. Si encuentras 
                alguna barrera de accesibilidad o tienes sugerencias de mejora, por favor contáctanos:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong> <a href="mailto:accessibility@viogi.com" className="underline">accessibility@viogi.com</a>
                </p>
                <p>
                  <strong>Teléfono:</strong> <a href="tel:+525555555555" className="underline">+52 55 5555 5555</a>
                </p>
                <p>
                  <strong>Dirección:</strong> Av. Presidente Masaryk 300, Polanco, CDMX, 11560
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                Intentaremos responder a tu solicitud dentro de 5 días hábiles.
              </p>
            </section>

            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Evaluación y auditorías
              </h3>
              <p className="text-gray-700">
                Este sitio web fue evaluado por última vez para accesibilidad en enero de 2026. 
                La evaluación se realizó mediante una combinación de herramientas automatizadas y pruebas manuales 
                realizadas por expertos en accesibilidad y usuarios con discapacidades.
              </p>
            </section>

            <section className="border-t pt-8 bg-gray-100 p-6 -mx-8 md:-mx-32 px-8 md:px-32">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Aprobación formal
              </h3>
              <p className="text-gray-700">
                Esta declaración de accesibilidad fue creada el 8 de enero de 2026 y se revisa periódicamente. 
                Está aprobada por la dirección de VIOGI.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

