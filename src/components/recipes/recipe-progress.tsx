import { Progress } from "@/components/ui/progress";

type Props = {
  step: number;
  total: number;
};

export function RecipeProgress({ step, total }: Props) {
  const value = (step / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {step} of {total}
        </span>
      </div>
      <Progress value={value} />
    </div>
  );
}
