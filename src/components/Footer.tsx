import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenCookiePrefs: () => void;
}

const Footer = ({ onOpenCookiePrefs }: FooterProps) => (
  <footer className="border-t border-white/10 bg-black">
    <div className="mx-auto flex max-w-[44rem] items-center justify-between gap-4 px-5 py-8 text-sm text-white/50">
      <p>
        <Link to="/admin" className="hover:text-white transition-colors" aria-label="Admin">
          ©
        </Link>{' '}
        {new Date().getFullYear()} Imad Eddine El Mouss
      </p>
      <button
        type="button"
        onClick={onOpenCookiePrefs}
        className="hover:text-white transition-colors focus-enhanced"
      >
        Cookie settings
      </button>
    </div>
  </footer>
);

export default Footer;
