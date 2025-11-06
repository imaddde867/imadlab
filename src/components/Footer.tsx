import { Link } from 'react-router-dom';

const Footer = () => {

  return (
    <footer className="mt-0 border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-sm text-white/60 max-w-md">
              Data Eng, AI/ML projects, blogs, and experiments by Imad Eddine.
            </p>
          </div>

          {/* Socials */}
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
