import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Tag } from "./tag"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tagVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-white/10 border-white/20 text-white",
        subtle: "bg-white/5 border-white/10 text-white/80",
        outline: "bg-transparent border-white/25 text-white/80 hover:bg-white/5",
        neutral: "bg-white/10 border-white/20 text-white/90",
        accent: "bg-sky-500/20 border-sky-400/40 text-sky-100",
        success: "bg-emerald-500/20 border-emerald-400/40 text-emerald-100",
        warning: "bg-amber-500/20 border-amber-400/40 text-amber-100",
        danger: "bg-rose-500/20 border-rose-400/40 text-rose-100",
        info: "bg-indigo-500/20 border-indigo-400/40 text-indigo-100",
      },
      size: {
        xs: "px-2.5 py-0.5 text-[11px]",
        sm: "px-3 py-1 text-xs",
        md: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

type TagVariantProps = VariantProps<typeof tagVariants>

type Breadcrumb = {
  label: string
  href: string
}

type MetaItem = {
  label: React.ReactNode
  icon?: React.ReactNode
  variant?: TagVariantProps["variant"]
  size?: TagVariantProps["size"]
  className?: string
}

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  meta?: MetaItem[]
  actions?: React.ReactNode
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      description,
      eyebrow,
      breadcrumbs,
      meta,
      actions,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl md:p-12",
          className
        )}
        {...props}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-28 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-28 -right-10 h-52 w-52 rounded-full bg-purple-500/20 blur-[120px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>

        <div className="relative space-y-8">
          {breadcrumbs?.length ? (
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/60">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                const classes =
                  "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"

                return (
                  <React.Fragment key={`${crumb.href}-${crumb.label}`}>
                    {isLast ? (
                      <span className={cn(classes, "text-white/80")} aria-current="page">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.href}
                        className={cn(classes, "text-white/60 hover:text-white")}
                      >
                        {crumb.label}
                      </Link>
                    )}
                    {!isLast && (
                      <ChevronRight className="h-3 w-3 text-white/40" aria-hidden="true" />
                    )}
                  </React.Fragment>
                )
              })}
            </nav>
          ) : null}

          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-6">
              {eyebrow ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                  {eyebrow}
                </div>
              ) : null}
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
                  {title}
                </h1>
                {description ? (
                  <p className="max-w-2xl text-base text-white/70 md:text-lg">
                    {description}
                  </p>
                ) : null}
              </div>
              {meta?.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  {meta.map((item, index) => (
                    <Tag
                      key={index}
                      variant={item.variant ?? "subtle"}
                      size={item.size ?? "sm"}
                      className={cn("backdrop-blur-md", item.className)}
                    >
                      {item.icon ? (
                        <span className="inline-flex items-center justify-center text-white/70">
                          {item.icon}
                        </span>
                      ) : null}
                      {item.label}
                    </Tag>
                  ))}
                </div>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-col items-start gap-3 md:items-end">
                {actions}
              </div>
            ) : null}
          </div>

          {children ? <div className="pt-2">{children}</div> : null}
        </div>
      </div>
    )
  }
)

PageHeader.displayName = "PageHeader"
