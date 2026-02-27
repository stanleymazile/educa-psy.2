import React from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Users, Award, HeartPulse, Sparkles } from 'lucide-react';

const values = [
  { title: "Empathie", description: "L'écoute active et la compréhension profonde sont au cœur de nos interventions.", icon: HeartPulse },
  { title: "Innovation", description: "Nous utilisons les dernières recherches en neurosciences et pédagogie.", icon: Sparkles },
  { title: "Inclusion", description: "Chaque individu mérite un accompagnement adapté à sa singularité.", icon: Users },
  { title: "Excellence", description: "Nous nous engageons à fournir des services de la plus haute qualité.", icon: Award }
];

export function About() {
  return (
    <div className="space-y-20 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-slate-900">À Propos d'Educa-Psy</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Fondée en 2015, Educa-Psy est née de la volonté de combler le fossé entre l'éducation formelle et le bien-être psychologique. Nous sommes une organisation multidisciplinaire regroupant des psychologues, des pédagogues et des travailleurs sociaux.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-4 bg-indigo-50 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600">10+</div>
              <div className="text-sm text-slate-600">Années d'expérience</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">25+</div>
              <div className="text-sm text-slate-600">Experts passionnés</div>
            </div>
          </div>
        </div>
        <div className="relative">
          <img 
            src="https://picsum.photos/seed/team/800/600" 
            alt="Notre équipe" 
            className="rounded-3xl shadow-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Notre Vision & Mission</h2>
          <p className="text-slate-600">
            Nous travaillons chaque jour pour construire une société où chacun a les outils pour s'épanouir pleinement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Notre Mission</h3>
            <p className="text-slate-600 leading-relaxed">
              Démocratiser l'accès au soutien psychologique et aux méthodes pédagogiques innovantes pour favoriser la réussite éducative et le bien-être émotionnel.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Notre Vision</h3>
            <p className="text-slate-600 leading-relaxed">
              Devenir la référence nationale en matière d'accompagnement psychosocial et éducatif, reconnue pour son impact positif et durable sur les familles.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-slate-900 text-center">Nos Valeurs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-slate-50 rounded-2xl text-center"
            >
              <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <value.icon size={20} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{value.title}</h4>
              <p className="text-sm text-slate-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
