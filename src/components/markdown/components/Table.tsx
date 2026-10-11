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
  <div role="region" aria-label="Markdown table" className="md-block w-full max-w-full">
    <div className="overflow-x-auto">
      <table
        className={clsx(
          'w-full border-collapse text-left text-[15px] leading-snug [font-variant-numeric:tabular-nums]',
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
  <thead className={clsx('text-white', className)} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ className, children, ...props }: SectionProps) => (
  <tbody className={clsx(className)} {...props}>
    {children}
  </tbody>
);

export const TableHeaderCell = ({ className, children, ...props }: HeaderCellProps) => (
  <th
    className={clsx(
      'border-b border-white/25 px-3 py-2 text-[14px] font-semibold text-white first:pl-0',
      className
    )}
    scope="col"
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ className, children, ...props }: CellProps) => (
  <td
    className={clsx(
      'whitespace-nowrap border-b border-white/10 px-3 py-2 align-top text-white/85 first:whitespace-normal first:pl-0',
      className
    )}
    {...props}
  >
    {children}
  </td>
);
