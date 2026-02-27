import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';

export function Contact() {
  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Contactez-nous</h1>
        <p className="text-lg text-slate-600">
          Vous avez une question ou souhaitez prendre rendez-vous ? Notre équipe est à votre écoute.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Send size={40} />
            </div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-2xl font-bold text-slate-900">Prêt à nous rejoindre ?</h2>
              <p className="text-slate-600">
                Cliquez sur le bouton ci-dessous pour accéder à notre formulaire d'inscription en ligne et commencer votre parcours avec Educa-Psy.
              </p>
            </div>
            <a 
              href="https://forms.gle/fY2uW3yNKT7t7RzG9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Formulaire d'inscription
              <ArrowRight size={24} />
            </a>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-6">Coordonnées</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="font-medium">contact@educapsy.org</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Téléphone</p>
                  <p className="font-medium">+33 1 23 45 67 89</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Adresse</p>
                  <p className="font-medium">123 Avenue de l'Éducation, 75001 Paris</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-2">Horaires d'ouverture</h3>
            <div className="space-y-2 text-sm text-indigo-800">
              <div className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span className="font-semibold">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Samedi</span>
                <span className="font-semibold">10:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span>Dimanche</span>
                <span className="font-semibold text-rose-600">Fermé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
