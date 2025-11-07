import type {
  DetailedHTMLProps,
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from 'react';
import clsx from 'clsx';

type TableProps = DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
type SectionProps = DetailedHTMLProps<
  HTMLAttributes<HTMLTableSectionElement>,
  HTMLTableSectionElement
>;
type CellProps = DetailedHTMLProps<TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>;
type HeaderCellProps = DetailedHTMLProps<
  ThHTMLAttributes<HTMLTableCellElement>,
  HTMLTableCellElement
>;

export const Table = ({ className, children, ...props }: TableProps) => (
  <div
    role="region"
    aria-label="Markdown table"
    className="relative my-8 w-full max-w-full rounded-lg border border-white/10 bg-white/5"
  >
    <div className="overflow-x-auto">
      <table
        className={clsx(
          'w-full border-collapse text-left text-sm text-white/80',
          'min-w-[420px]',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  </div>
);

export const TableHead = ({ className, children, ...props }: SectionProps) => (
  <thead className={clsx('bg-white/10 text-white', className)} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ className, children, ...props }: SectionProps) => (
  <tbody className={clsx('divide-y divide-white/10', className)} {...props}>
    {children}
  </tbody>
);

export const TableHeaderCell = ({ className, children, ...props }: HeaderCellProps) => (
  <th
    className={clsx(
      'sticky top-0 z-[1] bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white',
      className
    )}
    scope="col"
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ className, children, ...props }: CellProps) => (
  <td className={clsx('px-4 py-3 align-top text-sm text-white/80', className)} {...props}>
    {children}
  </td>
);
