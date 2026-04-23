import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Leaf, Shield, Globe } from 'lucide-react';
import { Button } from './ui/button';

export function MundoMelipona() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-md shadow-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-400 hover:text-amber-500 hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Mundo Melipona</h1>
            </div>
            
            <div className="hidden sm:block text-slate-400 text-sm font-medium tracking-widest uppercase">
              Patrimonio Ecológico
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-16 shadow-2xl border border-slate-800 aspect-video max-h-[400px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587334274328-64186a80aeee?q=80&w=2681&auto=format&fit=crop')] bg-cover bg-center brightness-50 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
            <div className="bg-amber-500/20 text-amber-400 border border-amber-500/50 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 w-max backdrop-blur-md">
              <Leaf className="w-4 h-4" />
              Reserva Natural
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">La Abeja Sagrada Maya</h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              Descubre a las abejas sin aguijón, un tesoro biológico de la Península de Yucatán, productoras de miel con propiedades curativas excepcionales.
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-amber-500/50 transition-colors shadow-lg group">
            <div className="bg-slate-800 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-3">Sin Aguijón</h3>
            <p className="text-slate-400 leading-relaxed">
              Las meliponas no poseen aguijón, lo que las hace inofensivas. Su defensa radica en mordiscos suaves, lo que permite un manejo apícola armonioso y familiar.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-amber-500/50 transition-colors shadow-lg group">
            <div className="bg-slate-800 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-3">Miel Medicinal</h3>
            <p className="text-slate-400 leading-relaxed">
              Pocos mililitros de miel melipona valen oro. Su humedad y fermentación natural le confieren propiedades antibióticas, cicatrizantes y regenerativas ampliamente estudiadas.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-amber-500/50 transition-colors shadow-lg group">
            <div className="bg-slate-800 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-3">Polinización</h3>
            <p className="text-slate-400 leading-relaxed">
              Son las principales polinizadoras de la selva nativa. Protegerlas significa preservar ecosistemas enteros en México y Centroamérica que dependen de ellas.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
