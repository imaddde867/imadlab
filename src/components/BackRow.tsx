import { Link } from 'react-router-dom';
import React from 'react';

interface BackRowProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}

const BackRow: React.FC<BackRowProps> = ({ to, label, icon, right }) => {
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

