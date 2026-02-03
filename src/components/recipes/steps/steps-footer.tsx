"use client";

import { Button } from "@/components/ui/button";

type Props = {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  loading?: boolean;
};

export function StepFooter({
  onBack,
  onNext,
  nextLabel = "Next",
  loading,
}: Props) {
  return (
    <div className="flex items-center justify-between pt-4">
      <Button variant="ghost" disabled={!onBack} onClick={onBack}>
        Previous
      </Button>

      <Button onClick={onNext} disabled={loading}>
        {loading ? "Saving..." : nextLabel}
      </Button>
    </div>
  );
}
