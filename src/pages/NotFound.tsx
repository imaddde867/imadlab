import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
    <h1 className="text-6xl font-black mb-6">404</h1>
    <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
    <p className="text-white/60 mb-8 text-center max-w-md">
      Sorry, the page you are looking for does not exist or has been moved.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-colors"
    >
      Go Home
    </Link>
  </div>
);

export default NotFound;
