import { Progress } from "@/components/ui/progress";

type Props = {
  step: number;
  total: number;
  label: string;
};

export function RecipeProgress({ step, total, label }: Props) {
  const value = (step / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {step} of {total} • {label}
        </span>
      </div>
      <Progress value={value} />
    </div>
  );
}
