import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase">
            Guía de Tallas
          </h1>

          <div className="space-y-12">
            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Cómo Medir</h2>
              <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-600">
                <div className="bg-white p-4 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Pecho</h3>
                  <p>Mide alrededor de la parte más ancha de tu pecho, manteniendo la cinta horizontal.</p>
                </div>
                <div className="bg-white p-4 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Cintura</h3>
                  <p>Mide alrededor de tu cintura natural, generalmente a la altura del ombligo.</p>
                </div>
                <div className="bg-white p-4 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Cadera</h3>
                  <p>Mide alrededor de la parte más ancha de tus caderas.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Playeras y Hoodies</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white border border-gray-200">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium">Talla</th>
                      <th className="text-left p-3 font-medium">Pecho (cm)</th>
                      <th className="text-left p-3 font-medium">Largo (cm)</th>
                      <th className="text-left p-3 font-medium">Hombro (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="p-3">S</td>
                      <td className="p-3">96-100</td>
                      <td className="p-3">68</td>
                      <td className="p-3">44</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3">M</td>
                      <td className="p-3">100-104</td>
                      <td className="p-3">70</td>
                      <td className="p-3">46</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3">L</td>
                      <td className="p-3">104-108</td>
                      <td className="p-3">72</td>
                      <td className="p-3">48</td>
                    </tr>
                    <tr>
                      <td className="p-3">XL</td>
                      <td className="p-3">108-112</td>
                      <td className="p-3">74</td>
                      <td className="p-3">50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Pants y Jeans</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white border border-gray-200">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium">Talla</th>
                      <th className="text-left p-3 font-medium">Cintura (cm)</th>
                      <th className="text-left p-3 font-medium">Cadera (cm)</th>
                      <th className="text-left p-3 font-medium">Largo (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="p-3">28</td>
                      <td className="p-3">71-74</td>
                      <td className="p-3">90-93</td>
                      <td className="p-3">100</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3">30</td>
                      <td className="p-3">76-79</td>
                      <td className="p-3">96-99</td>
                      <td className="p-3">102</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3">32</td>
                      <td className="p-3">81-84</td>
                      <td className="p-3">102-105</td>
                      <td className="p-3">104</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3">34</td>
                      <td className="p-3">86-89</td>
                      <td className="p-3">108-111</td>
                      <td className="p-3">106</td>
                    </tr>
                    <tr>
                      <td className="p-3">36</td>
                      <td className="p-3">91-94</td>
                      <td className="p-3">114-117</td>
                      <td className="p-3">108</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Notas</h2>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Nuestras prendas tienen un fit relajado/oversize</li>
                <li>• Si estás entre dos tallas, te recomendamos elegir la menor para un fit más ajustado</li>
                <li>• Las medidas pueden variar ±2cm</li>
                <li>• Si tienes dudas, contáctanos y te ayudamos a elegir tu talla</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
