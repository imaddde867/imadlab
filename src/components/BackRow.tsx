import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface BackRowProps {
  to: string;
  label: string;
  icon?: ReactNode;
  right?: ReactNode;
}

const BackRow = ({ to, label, icon, right }: BackRowProps) => {
  return (
    <div className="container-narrow pt-6">
      <div className="flex items-center justify-between text-sm text-white/70">
        <Link to={to} className="inline-flex items-center hover:text-white transition-colors group">
          {icon}
          {label}
        </Link>
        {right}
      </div>
    </div>
  );
};

export default BackRow;
