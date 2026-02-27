import React from 'react';
import { motion } from 'motion/react';
import { Brain, Users2, GraduationCap, HeartPulse, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const services = [
  {
    title: "Consultation Psychologique",
    description: "Sessions individuelles avec des psychologues cliniciens pour enfants, adolescents et adultes.",
    icon: Brain,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Soutien Scolaire Spécialisé",
    description: "Accompagnement pédagogique adapté aux besoins spécifiques de chaque élève (TDAH, Dys, etc.).",
    icon: GraduationCap,
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "Ateliers de Parentalité",
    description: "Espaces d'échange et de formation pour les parents souhaitant renforcer le lien avec leurs enfants.",
    icon: Users2,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Gestion du Stress",
    description: "Techniques de relaxation et de pleine conscience pour mieux gérer l'anxiété au quotidien.",
    icon: HeartPulse,
    color: "bg-rose-50 text-rose-600"
  },
  {
    title: "Orientation Professionnelle",
    description: "Bilan de compétences et accompagnement dans le choix de carrière ou la reconversion.",
    icon: Sparkles,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Médiation Familiale",
    description: "Résolution de conflits et amélioration de la communication au sein de la cellule familiale.",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600"
  }
];

export function Services() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Nos Services</h1>
        <p className="text-lg text-slate-600">
          Nous proposons une gamme complète de services pour répondre aux besoins éducatifs et psychologiques de notre communauté.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", service.color)}>
              <service.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              {service.description}
            </p>
            <button className="text-indigo-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              En savoir plus <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
