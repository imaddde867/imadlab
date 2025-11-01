import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-white mr-1" />
              <span className="font-semibold tracking-wide text-white">imadlab</span>
            </Link>
            <p className="text-sm text-white/60 max-w-md">
              Data Eng, AI/ML projects, blogs, and experiments by Imad Eddine.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-white/70">
            <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
            <Link to="/blogs" className="hover:text-white transition-colors">Blogs</Link>
            <Link to="/extras" className="hover:text-white transition-colors">Extras</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/imaddde867"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/imad-eddine-e-986741262"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="mailto:contact@imadlab.me"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/50">
          <Link to="/admin" className="hover:text-white transition-colors" aria-label="Admin">
            ©
          </Link>
          &nbsp;{new Date().getFullYear()} imadlab. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
