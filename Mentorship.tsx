import React from 'react';
import { motion } from 'motion/react';
import { Users, UserPlus, Compass, Award } from 'lucide-react';

export function Mentorship() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Mentorat</h1>
        <p className="text-lg text-slate-600">
          Transmettre l'expérience pour éclairer les parcours de vie.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Mentorat Jeunes", icon: UserPlus, desc: "Guider les étudiants vers leur réussite." },
          { title: "Coaching Pro", icon: Compass, desc: "Accompagnement dans la carrière et le leadership." },
          { title: "Réseautage", icon: Users, desc: "Connecter les talents et les opportunités." },
          { title: "Certification", icon: Award, desc: "Valider les acquis et les compétences." }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
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
