import React from 'react';
import { BrainCircuit, Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <BrainCircuit size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Educa-Psy</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Soutenir l'éducation et la santé mentale pour un avenir meilleur. Notre mission est d'accompagner chaque individu vers son plein potentiel.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Liens Rapides</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">Accueil</Link></li>
              <li><Link to="/apropos" className="hover:text-indigo-600 transition-colors">À Propos</Link></li>
              <li><Link to="/services" className="hover:text-indigo-600 transition-colors">Nos Services</Link></li>
              <li><Link to="/news" className="hover:text-indigo-600 transition-colors">Actualités</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Consultation Psy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Soutien Scolaire</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Ateliers Parents</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Médiation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-indigo-600" />
                <span>contact@educapsy.org</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-indigo-600" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Newsletter</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Votre email" 
                    className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                    OK
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © 2026 Educa-Psy. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
