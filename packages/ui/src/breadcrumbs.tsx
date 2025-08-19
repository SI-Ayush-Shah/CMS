import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-[14px] text-main-medium">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-main-high">
                {item.label}
              </Link>
            ) : (
              <span className="text-main-high">{item.label}</span>
            )}
            {idx < items.length - 1 && <span className="text-main-low">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}


