import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-4 tracking-tight">
          404 – Page Not Found
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8">
          Looks like you’ve wandered into the void.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 border border-white text-white text-lg font-medium uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
