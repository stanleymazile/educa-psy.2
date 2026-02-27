import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Puzzle, Trophy, Zap } from 'lucide-react';

export function Games() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Jeux</h1>
        <p className="text-lg text-slate-600">
          Le jeu comme vecteur d'apprentissage et de développement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Ludo-pédagogie", icon: Gamepad2, desc: "Apprendre par le jeu et l'interaction." },
          { title: "Serious Games", icon: Zap, desc: "Simulations pour le développement de compétences." },
          { title: "Ateliers Ludiques", icon: Puzzle, desc: "Espaces de jeu pour renforcer la cohésion." },
          { title: "Compétition", icon: Trophy, desc: "Tournois et défis pour stimuler la motivation." }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
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
