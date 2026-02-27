import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Info, 
  Briefcase, 
  Mail, 
  Newspaper, 
  BrainCircuit,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  ChevronDown,
  GraduationCap,
  Brain,
  Search,
  Users,
  Gamepad2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Accueil', path: '/', icon: Home },
  { name: 'À Propos', path: '/apropos', icon: Info },
  { name: 'Services', path: '/services', icon: Briefcase },
  { name: 'Éducation', path: '/education', icon: GraduationCap },
  { name: 'Psychologie', path: '/psychologie', icon: Brain },
  { name: 'Recherche', path: '/recherche', icon: Search },
  { name: 'Mentorat', icon: Users, path: '/mentorat' },
  { name: 'Jeux', icon: Gamepad2, path: '/jeux' },
  { name: 'Actualités', path: '/news', icon: Newspaper },
  { name: 'Contact', path: '/contact', icon: Mail },
];

export const Sidebar = React.memo(({ isOpen, setIsOpen }: SidebarProps) => {
  const [lang, setLang] = React.useState<'FR' | 'EN'>('FR');

  const handleLinkClick = () => {
    // Close sidebar when a link is clicked
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ willChange: 'transform' }}
          className={cn(
            "fixed inset-y-0 right-0 z-40 w-72 bg-white border-l border-slate-200 flex flex-col shadow-2xl"
          )}
          id="main-sidebar"
        >
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <BrainCircuit size={20} />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Educa-Psy</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6 custom-scrollbar">
            {/* Language Selector */}
            <div className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500">
                <Globe size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Langue</span>
              </div>
              <div className="flex gap-1">
                {(['FR', 'EN'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded transition-all",
                      lang === l 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 font-medium" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    "group-hover:text-indigo-600"
                  )} />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Info Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="px-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Informations</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">Siège Social</span>
                    <span className="text-[11px] text-slate-500">123 Avenue de l'Éducation, Paris</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">Horaires</span>
                    <span className="text-[11px] text-slate-500">Lun-Ven: 09h - 18h</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg shadow-indigo-200">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Soutien 24/7</p>
                <p className="text-sm font-bold mb-3">Besoin d'une écoute immédiate ?</p>
                <button className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors">
                  Appeler le 01 23 45 67 89
                </button>
              </div>
            </div>
          </div>

          {/* Social Media & Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-center gap-4 mb-4">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            <p className="text-[10px] text-center text-slate-400 font-medium">
              © 2026 Educa-Psy. <br />
              Tous droits réservés.
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
});
