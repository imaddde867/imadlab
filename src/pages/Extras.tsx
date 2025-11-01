import Seo from '@/components/Seo';
import SectionHeader from '@/components/SectionHeader';
import StravaStats from '@/components/StravaStats';

const Extras = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Seo
        title="Extras"
        description="Additional content and activities from Imad Eddine Elmouss"
        keywords="strava, running, cycling, fitness, activities"
        type="website"
      />
      <div className="max-w-7xl mx-auto px-4 py-24">
        <SectionHeader
          title="Extras"
          subtitle={<>Beyond code<br />I LOVE running too!!</>}
        />
        <div className="mt-12">
          <StravaStats />
        </div>
      </div>
    </div>
  );
};

export default Extras;
