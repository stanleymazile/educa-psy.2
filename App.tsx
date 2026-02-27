import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { News } from './pages/News';
import { Contact } from './pages/Contact';
import { Education } from './pages/Education';
import { Psychology } from './pages/Psychology';
import { Research } from './pages/Research';
import { Mentorship } from './pages/Mentorship';
import { Games } from './pages/Games';
import { ArticleDetail } from './pages/ArticleDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="apropos" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="education" element={<Education />} />
          <Route path="psychologie" element={<Psychology />} />
          <Route path="recherche" element={<Research />} />
          <Route path="mentorat" element={<Mentorship />} />
          <Route path="jeux" element={<Games />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<ArticleDetail />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
}
