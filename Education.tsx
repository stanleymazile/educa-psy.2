import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Target, Users } from 'lucide-react';

export function Education() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Éducation</h1>
        <p className="text-lg text-slate-600">
          L'excellence pédagogique au service de la réussite de chaque apprenant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Soutien Scolaire", icon: BookOpen, desc: "Accompagnement personnalisé pour toutes les matières." },
          { title: "Méthodologie", icon: Target, desc: "Apprendre à apprendre avec des outils modernes." },
          { title: "Orientation", icon: GraduationCap, desc: "Définir son parcours académique et professionnel." },
          { title: "Formations", icon: Users, desc: "Ateliers pour élèves, parents et enseignants." }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
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
