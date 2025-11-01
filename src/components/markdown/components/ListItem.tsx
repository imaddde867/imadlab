import { useState } from 'react';
import type { DetailedHTMLProps, LiHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ListItemProps = DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement> & {
  checked?: boolean | null;
  children?: ReactNode;
};

export const ListItem = ({ checked, className, children, ...props }: ListItemProps) => {
  const [isChecked, setIsChecked] = useState<boolean | null>(checked ?? null);

  if (typeof checked === 'boolean') {
    return (
      <li
        className={clsx(
          'contains-task-list-item flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5',
          className
        )}
        {...props}
      >
        <span className="mt-1 flex h-5 w-5 items-center justify-center">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border border-white/40 bg-black/40 accent-blue-500"
            checked={Boolean(isChecked)}
            aria-checked={Boolean(isChecked)}
            onChange={() => setIsChecked((value) => !value)}
          />
        </span>
        <div className="flex-1 text-base leading-7 text-white/80">{children}</div>
      </li>
    );
  }

  return (
    <li className={clsx('text-base leading-7 text-white/80', className)} {...props}>
      {children}
    </li>
  );
};

