const chapters = [
  {
    number: "01",
    title: "Origins",
    description: "El inicio de VIOGI. Una visión de streetwear premium accesible nacida en México.",
    date: "2024",
  },
  {
    number: "02",
    title: "Streets",
    description: "Inspiración urbana. La cultura de la calle como lienzo de expresión.",
    date: "2025",
  },
  {
    number: "03",
    title: "Coming Soon",
    description: "El siguiente capítulo está en desarrollo.",
    date: "2025",
  },
];

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default function ChaptersPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <h1
          className="uppercase tracking-wide mb-12"
          style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}
        >
          CHAPTERS
        </h1>

        <div className="space-y-0">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.number}
              className={`border-t border-gray-200 py-8 ${index === chapters.length - 1 ? 'border-b' : ''}`}
            >
              <div className="flex items-start gap-8">
                <span
                  style={{ ...fontStyle, fontSize: '32px', fontWeight: 300, color: '#ccc', lineHeight: 1 }}
                >
                  {chapter.number}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <p
                      className="uppercase tracking-wide"
                      style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                    >
                      {chapter.title}
                    </p>
                    <span style={{ ...fontStyle, fontSize: '11px', color: '#999' }}>{chapter.date}</span>
                  </div>
                  <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
                    {chapter.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
