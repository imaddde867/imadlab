import { Link } from "react-router-dom";
import MetaBalls from "@/components/MetaBalls";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* MetaBalls background */}
      <div className="absolute inset-0 pointer-events-auto z-0 opacity-90">
        <MetaBalls
          color="#ffffff"
          cursorBallColor="#ffffff"
          cursorBallSize={2}
          ballCount={15}
          animationSize={30}
          enableMouseInteraction={true}
          enableTransparency={true}
          hoverSmoothness={0.05}
          clumpFactor={1}
          speed={0.3}
        />
      </div>
      <div className="text-center animate-fade-in relative z-10">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-4 tracking-tight drop-shadow-2xl">
          404 – Page Not Found
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 drop-shadow-xl">
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
