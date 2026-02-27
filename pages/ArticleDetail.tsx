import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { newsArticles } from '../data/newsData';
import Markdown from 'react-markdown';

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = newsArticles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Article non trouvé</h2>
        <button 
          onClick={() => navigate('/news')}
          className="text-indigo-600 font-semibold flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={20} /> Retour aux actualités
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <Link 
        to="/news" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
        Retour aux actualités
      </Link>

      <div className="space-y-8 w-full overflow-hidden">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {article.category}
            </span>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} /> {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={16} /> {article.author}
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight break-words">
            {article.title}
          </h1>
        </div>

        <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-xl bg-slate-100">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-slate prose-indigo max-w-none break-words overflow-hidden">
          <div className="markdown-body">
            <Markdown>{article.content}</Markdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
