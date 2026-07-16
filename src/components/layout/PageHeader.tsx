import type { ReactNode } from "react";
import { MobilePageHeader } from "@/components/mobile/MobilePageHeader";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  showSettings?: boolean;
}

export function PageHeader({
  title,
  description,
  action,
  backHref,
  showSettings,
}: PageHeaderProps) {
  return (
    <>
      <MobilePageHeader
        title={title}
        subtitle={description}
        action={action}
        backHref={backHref}
        showSettings={showSettings}
      />
      <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-foreground-secondary mt-1">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </>
  );
}
