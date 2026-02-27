import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Users, Heart, BookOpen, Star, GraduationCap, Brain, Search, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const stats = [
  { label: 'Bénéficiaires', value: '5000', suffix: '+', icon: Users },
  { label: 'Interventions', value: '1200', suffix: '+', icon: Heart },
  { label: 'Formations', value: '450', suffix: '+', icon: BookOpen },
  { label: 'Satisfaction', value: '98', suffix: '%', icon: Star },
];

const expertises = [
  { name: 'Éducation', path: '/education', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Psychologie', path: '/psychologie', icon: Brain, color: 'bg-purple-50 text-purple-600' },
  { name: 'Recherche', path: '/recherche', icon: Search, color: 'bg-blue-50 text-blue-600' },
  { name: 'Mentorat', path: '/mentorat', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Jeux', path: '/jeux', icon: Gamepad2, color: 'bg-amber-50 text-amber-600' },
];

export function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-16 lg:p-24">
        <div className="relative z-10 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Éduquer l'esprit, <br />
            <span className="text-indigo-400">Soutenir l'âme.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed"
          >
            Educa-Psy s'engage à fournir des ressources éducatives et un accompagnement psychologique de qualité pour favoriser l'épanouissement de chacun.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/services" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
              Nos Services <ArrowRight size={20} />
            </Link>
            <Link to="/apropos" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all backdrop-blur-sm">
              En savoir plus
            </Link>
          </motion.div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
      </section>

      {/* Nos Expertises Section */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Nos Expertises</h2>
          <p className="text-slate-600">
            Une approche multidisciplinaire pour un accompagnement complet et innovant.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {expertises.map((exp, index) => (
            <motion.div
              key={exp.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={exp.path}
                className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", exp.color)}>
                  <exp.icon size={28} />
                </div>
                <span className="font-bold text-slate-900 text-sm md:text-base">{exp.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <stat.icon size={24} />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stat.value}{stat.suffix}
            </div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Featured Content */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Notre Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            Nous croyons que l'éducation et la santé mentale sont les deux piliers d'une vie équilibrée. Notre approche holistique combine expertise pédagogique et soutien clinique pour aider les individus à surmonter les défis de la vie moderne.
          </p>
          <ul className="space-y-4">
            {[
              "Accompagnement personnalisé",
              "Ateliers de groupe thématiques",
              "Ressources numériques accessibles",
              "Réseau de professionnels qualifiés"
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <ArrowRight size={12} />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <img 
            src="https://picsum.photos/seed/educapsy/800/600" 
            alt="Collaboration" 
            className="rounded-3xl shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
            <p className="text-slate-900 font-medium italic">
              "L'éducation est l'arme la plus puissante pour changer le monde."
            </p>
            <p className="text-sm text-slate-500 mt-2">— Nelson Mandela</p>
          </div>
        </div>
      </section>
    </div>
  );
}
