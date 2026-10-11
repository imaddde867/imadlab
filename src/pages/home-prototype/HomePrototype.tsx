// PROTOTYPE (throwaway): three homepage variants on `/?variant=A|B|C` (dev only).
import PrototypeSwitcher from '@/components/prototype/PrototypeSwitcher';
import { useHomeData } from './data';
import VariantA from './VariantA';
import VariantB from './VariantB';
import VariantC from './VariantC';

const variants = [
  { key: 'A', name: 'Plain page', Component: VariantA },
  { key: 'B', name: 'Evidence console', Component: VariantB },
  { key: 'C', name: 'Case-study led', Component: VariantC },
];

const HomePrototype = ({ variant }: { variant: string }) => {
  const data = useHomeData();
  const current = variants.find((v) => v.key === variant) ?? variants[0];
  return (
    <>
      <current.Component {...data} />
      <PrototypeSwitcher variants={variants} current={current.key} />
    </>
  );
};

export default HomePrototype;
