import React from 'react';
import { motion } from 'motion/react';
import { Brain, Heart, Shield, Sparkles } from 'lucide-react';

export function Psychology() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Psychologie</h1>
        <p className="text-lg text-slate-600">
          Un accompagnement bienveillant pour votre équilibre mental et émotionnel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Consultations", icon: Brain, desc: "Suivi individuel pour enfants, ados et adultes." },
          { title: "Thérapie Familiale", icon: Heart, desc: "Renforcer les liens et résoudre les conflits." },
          { title: "Gestion du Stress", icon: Shield, desc: "Techniques de relaxation et pleine conscience." },
          { title: "Bilans Psy", icon: Sparkles, desc: "Évaluations cognitives et affectives complètes." }
        ].map((item, i) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
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
