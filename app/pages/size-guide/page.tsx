import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SizeGuidePage() {
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
            Guía de tallas
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
                Encuentra tu talla perfecta
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Utiliza nuestras guías de tallas para encontrar el ajuste perfecto. Si tienes dudas entre 
                dos tallas, te recomendamos elegir la más grande para un ajuste más cómodo.
              </p>
            </section>

            {/* Playeras y Camisas */}
            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Playeras y Camisas
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-300 px-4 py-2 text-left">Talla</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Pecho (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Largo (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Hombros (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">XS</td>
                      <td className="border border-gray-300 px-4 py-2">86-91</td>
                      <td className="border border-gray-300 px-4 py-2">68</td>
                      <td className="border border-gray-300 px-4 py-2">42</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">S</td>
                      <td className="border border-gray-300 px-4 py-2">91-96</td>
                      <td className="border border-gray-300 px-4 py-2">70</td>
                      <td className="border border-gray-300 px-4 py-2">44</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">M</td>
                      <td className="border border-gray-300 px-4 py-2">96-101</td>
                      <td className="border border-gray-300 px-4 py-2">72</td>
                      <td className="border border-gray-300 px-4 py-2">46</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">L</td>
                      <td className="border border-gray-300 px-4 py-2">101-106</td>
                      <td className="border border-gray-300 px-4 py-2">74</td>
                      <td className="border border-gray-300 px-4 py-2">48</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">XL</td>
                      <td className="border border-gray-300 px-4 py-2">106-111</td>
                      <td className="border border-gray-300 px-4 py-2">76</td>
                      <td className="border border-gray-300 px-4 py-2">50</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">XXL</td>
                      <td className="border border-gray-300 px-4 py-2">111-116</td>
                      <td className="border border-gray-300 px-4 py-2">78</td>
                      <td className="border border-gray-300 px-4 py-2">52</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Hoodies y Chamarras */}
            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Hoodies y Chamarras
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-300 px-4 py-2 text-left">Talla</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Pecho (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Largo (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Mangas (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">XS</td>
                      <td className="border border-gray-300 px-4 py-2">90-95</td>
                      <td className="border border-gray-300 px-4 py-2">65</td>
                      <td className="border border-gray-300 px-4 py-2">61</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">S</td>
                      <td className="border border-gray-300 px-4 py-2">95-100</td>
                      <td className="border border-gray-300 px-4 py-2">67</td>
                      <td className="border border-gray-300 px-4 py-2">63</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">M</td>
                      <td className="border border-gray-300 px-4 py-2">100-105</td>
                      <td className="border border-gray-300 px-4 py-2">69</td>
                      <td className="border border-gray-300 px-4 py-2">65</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">L</td>
                      <td className="border border-gray-300 px-4 py-2">105-110</td>
                      <td className="border border-gray-300 px-4 py-2">71</td>
                      <td className="border border-gray-300 px-4 py-2">67</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">XL</td>
                      <td className="border border-gray-300 px-4 py-2">110-115</td>
                      <td className="border border-gray-300 px-4 py-2">73</td>
                      <td className="border border-gray-300 px-4 py-2">69</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">XXL</td>
                      <td className="border border-gray-300 px-4 py-2">115-120</td>
                      <td className="border border-gray-300 px-4 py-2">75</td>
                      <td className="border border-gray-300 px-4 py-2">71</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Pants y Jeans */}
            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Pants y Jeans
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-300 px-4 py-2 text-left">Talla</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Cintura (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Cadera (cm)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Entrepierna (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">28</td>
                      <td className="border border-gray-300 px-4 py-2">71-73</td>
                      <td className="border border-gray-300 px-4 py-2">91-93</td>
                      <td className="border border-gray-300 px-4 py-2">81</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">30</td>
                      <td className="border border-gray-300 px-4 py-2">76-78</td>
                      <td className="border border-gray-300 px-4 py-2">96-98</td>
                      <td className="border border-gray-300 px-4 py-2">81</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">32</td>
                      <td className="border border-gray-300 px-4 py-2">81-83</td>
                      <td className="border border-gray-300 px-4 py-2">101-103</td>
                      <td className="border border-gray-300 px-4 py-2">81</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">34</td>
                      <td className="border border-gray-300 px-4 py-2">86-88</td>
                      <td className="border border-gray-300 px-4 py-2">106-108</td>
                      <td className="border border-gray-300 px-4 py-2">81</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-2 font-bold">36</td>
                      <td className="border border-gray-300 px-4 py-2">91-93</td>
                      <td className="border border-gray-300 px-4 py-2">111-113</td>
                      <td className="border border-gray-300 px-4 py-2">81</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">38</td>
                      <td className="border border-gray-300 px-4 py-2">96-98</td>
                      <td className="border border-gray-300 px-4 py-2">116-118</td>
                      <td className="border border-gray-300 px-4 py-2">81</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Cómo medir */}
            <section className="border-t pt-8">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Cómo tomar tus medidas
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Pecho:</h4>
                  <p className="text-gray-700">
                    Mide alrededor de la parte más amplia del pecho, manteniendo la cinta métrica horizontal.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Cintura:</h4>
                  <p className="text-gray-700">
                    Mide la parte más estrecha de tu cintura, generalmente donde se dobla naturalmente tu torso.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Cadera:</h4>
                  <p className="text-gray-700">
                    Mide alrededor de la parte más amplia de tus caderas y glúteos.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Entrepierna:</h4>
                  <p className="text-gray-700">
                    Mide desde la entrepierna hasta el tobillo, o hasta donde prefieras que llegue el pantalón.
                  </p>
                </div>
              </div>
            </section>

            {/* Ayuda */}
            <section className="border-t pt-8 bg-gray-100 p-6 -mx-8 md:-mx-32 px-8 md:px-32">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                ¿Necesitas ayuda con tu talla?
              </h3>
              <p className="text-gray-700">
                Si tienes dudas sobre qué talla elegir, no dudes en{' '}
                <a href="/pages/customer-support" className="underline font-bold">contactarnos</a>.
                Nuestro equipo estará encantado de ayudarte a encontrar el ajuste perfecto.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

