import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, ArrowRight, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { newsArticles } from '../data/newsData';
import { cn } from '@/src/lib/utils';

const categories = ['Tous', 'Éducation', 'Psychologie', 'Recherche', 'Événement'];

export function News() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'old'>('recent');

  const filteredNews = useMemo(() => {
    return newsArticles
      .filter(item => {
        const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
      });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Actualités</h1>
        <p className="text-lg text-slate-600">
          Restez informé des dernières nouvelles, articles et événements d'Educa-Psy.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === cat 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'old')}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="recent">Plus récents</option>
            <option value="old">Plus anciens</option>
          </select>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredNews.map((item, index) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <Link to={`/news/${item.id}`} className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                    {item.category}
                  </span>
                </div>
              </Link>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={14} /> {item.author}
                  </span>
                </div>
                <Link to={`/news/${item.id}`}>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                  {item.excerpt}
                </p>
                <div className="mt-auto">
                  <Link 
                    to={`/news/${item.id}`} 
                    className="text-indigo-600 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Lire la suite <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-500">Aucun article ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
