import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  color: string;
}

const MoodButton = ({ icon: Icon, label, description, isSelected, onClick, color }: MoodButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 smooth-transition",
        "border-2 hover:shadow-lg hover:scale-105",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <div className="flex flex-col items-center space-y-3 text-center">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center smooth-transition",
            isSelected ? "bg-primary/20" : "bg-secondary group-hover:bg-primary/10"
          )}
        >
          <Icon className={cn("w-8 h-8", isSelected ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div>
          <h3 className={cn("text-lg font-semibold", isSelected ? "text-primary" : "text-foreground")}>
            {label}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default MoodButton;
