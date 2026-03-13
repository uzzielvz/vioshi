import SupportNav from '@/components/SupportNav';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="md:hidden">
        <SupportNav />
      </div>
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <h1
          className="uppercase tracking-wide mb-12 border-b border-gray-200 pb-4"
          style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
        >
          Legal
        </h1>

        <div className="space-y-12">
          <section>
            <h2
              className="uppercase tracking-wide mb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
            >
              Términos y Condiciones
            </h2>
            <div className="space-y-4">
              <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
                Al acceder y utilizar el sitio web de VIOGI, aceptas cumplir con estos términos
                y condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos,
                te pedimos que no utilices nuestro sitio.
              </p>
              <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
                VIOGI se reserva el derecho de modificar estos términos en cualquier momento.
                Los cambios serán efectivos inmediatamente después de su publicación en el sitio.
              </p>
            </div>
          </section>

          <section>
            <h2
              className="uppercase tracking-wide mb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
            >
              Política de Privacidad
            </h2>
            <div className="space-y-4">
              <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
                En VIOGI, respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
                Esta política describe cómo recopilamos, utilizamos y protegemos tu información.
              </p>
              <p
                className="uppercase tracking-wide"
                style={{ ...fontStyle, fontSize: '10px', fontWeight: 500, color: '#000', marginTop: '12px' }}
              >
                Información que Recopilamos
              </p>
              <ul className="space-y-1 list-disc list-inside" style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                <li>Información de contacto (nombre, email, teléfono, dirección)</li>
                <li>Información de pago (procesada de forma segura por terceros)</li>
                <li>Historial de compras</li>
                <li>Preferencias de navegación</li>
              </ul>
              <p
                className="uppercase tracking-wide"
                style={{ ...fontStyle, fontSize: '10px', fontWeight: 500, color: '#000', marginTop: '12px' }}
              >
                Uso de la Información
              </p>
              <ul className="space-y-1 list-disc list-inside" style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                <li>Procesar y enviar tus pedidos</li>
                <li>Comunicarnos contigo sobre tu cuenta o pedidos</li>
                <li>Mejorar nuestros productos y servicios</li>
                <li>Enviarte información promocional (solo si lo autorizas)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2
              className="uppercase tracking-wide mb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
            >
              Propiedad Intelectual
            </h2>
            <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              Todo el contenido de este sitio, incluyendo pero no limitado a textos, gráficos,
              logos, imágenes, clips de audio, descargas digitales y compilaciones de datos,
              es propiedad de VIOGI o sus proveedores de contenido y está protegido por las
              leyes de propiedad intelectual de México e internacionales.
            </p>
          </section>

          <section>
            <h2
              className="uppercase tracking-wide mb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
            >
              Cookies
            </h2>
            <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              Utilizamos cookies para mejorar tu experiencia de navegación. Al usar nuestro sitio,
              aceptas el uso de cookies de acuerdo con nuestra política. Puedes configurar tu
              navegador para rechazar cookies, pero esto puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section>
            <h2
              className="uppercase tracking-wide mb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
            >
              Contacto Legal
            </h2>
            <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              Para cualquier consulta legal, puedes contactarnos en:{' '}
              <span style={{ color: '#000', fontWeight: 500 }}>legal@viogi.com</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
