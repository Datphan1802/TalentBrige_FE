import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
      {icon || <Inbox className="w-8 h-8 text-primary" />}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
  </div>
);

export default EmptyState;
