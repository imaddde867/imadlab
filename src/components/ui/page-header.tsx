import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Breadcrumb = {
  label: string;
  href: string;
};

type MetaItem = {
  label: React.ReactNode;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  meta?: MetaItem[];
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    { title, description, eyebrow, breadcrumbs, meta, actions, className, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8',
          className
        )}
        {...props}
      >
        <div className="space-y-6">
          {breadcrumbs?.length ? (
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs text-white/60"
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const classes =
                  'flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

                return (
                  <React.Fragment key={`${crumb.href}-${crumb.label}`}>
                    {isLast ? (
                      <span className={cn(classes, 'text-white/80')} aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.href}
                        className={cn(classes, 'text-white/60 hover:text-white')}
                      >
                        {crumb.label}
                      </Link>
                    )}
                    {!isLast && (
                      <ChevronRight className="h-3 w-3 text-white/40" aria-hidden="true" />
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : null}

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              {eyebrow ? (
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  {eyebrow}
                </div>
              ) : null}
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-white md:text-3xl">{title}</h1>
                {description ? (
                  <p className="max-w-2xl text-sm text-white/65 md:text-base">{description}</p>
                ) : null}
              </div>
              {meta?.length ? (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
                  {meta.map((item, index) => (
                    <div key={index} className={cn('flex items-center gap-2', item.className)}>
                      {item.icon ? (
                        <span className="inline-flex items-center justify-center text-white/40">
                          {item.icon}
                        </span>
                      ) : null}
                      {item.value !== undefined ? (
                        <>
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                            {item.label}
                          </span>
                          <span className="font-semibold text-white">{item.value}</span>
                        </>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-col items-start gap-3 md:items-end">{actions}</div>
            ) : null}
          </div>

          {children ? <div className="pt-2">{children}</div> : null}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
