import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LegalPage() {
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
            Legal
          </h1>

          <div 
            className="space-y-12"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif"
            }}
          >
            {/* Términos y Condiciones */}
            <section>
              <h2 
                className="text-2xl font-bold mb-6 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Términos y Condiciones
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <p>
                  Última actualización: Enero 2026
                </p>

                <div>
                  <h3 className="font-bold text-black mb-2">1. Aceptación de términos</h3>
                  <p>
                    Al acceder y utilizar este sitio web, aceptas estar sujeto a estos términos y condiciones de uso, 
                    todas las leyes y regulaciones aplicables, y aceptas que eres responsable del cumplimiento de 
                    las leyes locales aplicables.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">2. Uso del sitio</h3>
                  <p>
                    Este sitio web es proporcionado para tu uso personal y no comercial. No puedes modificar, 
                    copiar, distribuir, transmitir, mostrar, realizar, reproducir, publicar, licenciar, crear 
                    trabajos derivados, transferir o vender cualquier información obtenida de este sitio web.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">3. Propiedad intelectual</h3>
                  <p>
                    Todo el contenido incluido en este sitio, como texto, gráficos, logos, íconos de botones, 
                    imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de VIOGI 
                    o de sus proveedores de contenido y está protegido por las leyes de derechos de autor mexicanas 
                    e internacionales.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">4. Exactitud de la información</h3>
                  <p>
                    Hacemos todo lo posible para garantizar que la información en nuestro sitio sea precisa. Sin embargo, 
                    no garantizamos que las descripciones de productos u otro contenido sean precisos, completos, 
                    confiables, actuales o libres de errores.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">5. Precios y disponibilidad</h3>
                  <p>
                    Todos los precios están sujetos a cambios sin previo aviso. Nos reservamos el derecho de modificar 
                    o discontinuar productos sin previo aviso. No seremos responsables ante ti o cualquier tercero por 
                    cualquier modificación, cambio de precio, suspensión o discontinuación de un producto.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">6. Limitación de responsabilidad</h3>
                  <p>
                    En ningún caso VIOGI o sus proveedores serán responsables de daños (incluyendo, sin limitación, 
                    daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surjan del uso 
                    o la imposibilidad de usar los materiales en el sitio de VIOGI.
                  </p>
                </div>
              </div>
            </section>

            {/* Política de Privacidad */}
            <section className="border-t pt-8">
              <h2 
                className="text-2xl font-bold mb-6 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Política de Privacidad
              </h2>
              
              <div className="space-y-6 text-gray-700">
                <p>
                  En VIOGI, accesible desde viogi.com, una de nuestras principales prioridades es la privacidad 
                  de nuestros visitantes. Esta Política de Privacidad contiene los tipos de información que es 
                  recopilada y registrada por VIOGI y cómo la usamos.
                </p>

                <div>
                  <h3 className="font-bold text-black mb-2">Información que recopilamos</h3>
                  <p className="mb-2">Recopilamos varios tipos de información, incluyendo:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Información personal (nombre, dirección de correo electrónico, dirección postal, número de teléfono)</li>
                    <li>Información de pago (procesada de forma segura por terceros)</li>
                    <li>Información de navegación y uso del sitio</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Cómo usamos tu información</h3>
                  <p className="mb-2">Utilizamos la información que recopilamos de diversas maneras, incluyendo:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Procesar y completar tus pedidos</li>
                    <li>Comunicarnos contigo sobre tu pedido</li>
                    <li>Mejorar nuestro sitio web y servicios</li>
                    <li>Enviarte correos electrónicos promocionales (con tu consentimiento)</li>
                    <li>Prevenir actividades fraudulentas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Cookies</h3>
                  <p>
                    Como la mayoría de los sitios web, usamos cookies y tecnologías similares para mejorar tu 
                    experiencia. Las cookies son pequeños archivos que un sitio o su proveedor de servicios transfiere 
                    al disco duro de tu computadora a través de tu navegador web (si lo permites) que permite a los 
                    sistemas del sitio reconocer tu navegador y capturar y recordar cierta información.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Compartir información con terceros</h3>
                  <p>
                    No vendemos, intercambiamos ni transferimos de ninguna otra forma tu información personal a 
                    terceros sin tu consentimiento, excepto según lo necesario para proporcionar nuestros servicios 
                    (como procesadores de pago y servicios de envío).
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Tus derechos</h3>
                  <p className="mb-2">Tienes derecho a:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Acceder a tu información personal</li>
                    <li>Corregir información inexacta</li>
                    <li>Solicitar la eliminación de tu información</li>
                    <li>Oponerte al procesamiento de tu información</li>
                    <li>Solicitar la transferencia de tu información</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">Seguridad</h3>
                  <p>
                    Implementamos una variedad de medidas de seguridad para mantener la seguridad de tu información 
                    personal. Usamos cifrado de última generación para proteger la información sensible transmitida en línea.
                  </p>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="border-t pt-8">
              <h2 
                className="text-2xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Contacto
              </h2>
              <p className="text-gray-700">
                Si tienes alguna pregunta sobre estos Términos y Condiciones o nuestra Política de Privacidad, 
                por favor contáctanos a:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> <a href="mailto:legal@viogi.com" className="underline">legal@viogi.com</a><br />
                <strong>Dirección:</strong> Av. Presidente Masaryk 300, Polanco, CDMX, 11560
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

