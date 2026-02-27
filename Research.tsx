import React from 'react';
import { motion } from 'motion/react';
import { Search, Microscope, FileText, Lightbulb } from 'lucide-react';

export function Research() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Recherche</h1>
        <p className="text-lg text-slate-600">
          Innover par la science pour transformer les pratiques éducatives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Neurosciences", icon: Microscope, desc: "Études sur les mécanismes de l'apprentissage." },
          { title: "Veille Scientifique", icon: Search, desc: "Analyse des dernières tendances mondiales." },
          { title: "Publications", icon: FileText, desc: "Partage de nos découvertes et méthodologies." },
          { title: "Innovation", icon: Lightbulb, desc: "Développement de nouveaux outils pédagogiques." }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
            <p className="text-slate-600 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
