"use client";

import { useState } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, X } from "lucide-react";

type Props = {
  steps: string[];
  setSteps: (v: string[]) => void;
};

/* ───────────────────────── Sortable Step ───────────────────────── */

function SortableStep({
  id,
  value,
  onChange,
  onRemove,
  showIndicatorAbove,
  dragging = false,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  showIndicatorAbove: boolean;
  dragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition
      ? "transform 200ms cubic-bezier(0.2, 0, 0, 1)"
      : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-background relative flex items-start gap-2 rounded-md border p-3 ${
        dragging ? "shadow-lg" : ""
      }`}
    >
      {/* Drop indicator */}
      {showIndicatorAbove && (
        <div className="bg-primary absolute -top-2 right-6 left-6 h-[2px] rounded" />
      )}

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground mt-1 cursor-grab"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Step content */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe this step..."
        className="min-h-[60px]"
      />

      {/* Remove */}
      <Button size="icon" variant="ghost" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* ───────────────────────── Drop animation ───────────────────────── */

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

/* ───────────────────────── Main Card ───────────────────────── */

export function StepsCard({ steps, setSteps }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = steps.findIndex((_, i) => i.toString() === active.id);
    const newIndex = steps.findIndex((_, i) => i.toString() === over.id);

    setSteps(arrayMove(steps, oldIndex, newIndex));
  };

  const activeStep = activeId !== null ? steps[Number(activeId)] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Steps</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event: DragStartEvent) =>
            setActiveId(event.active.id as string)
          }
          onDragOver={(event: DragOverEvent) =>
            setOverId(event.over?.id as string | null)
          }
          onDragEnd={(event) => {
            handleDragEnd(event);
            setActiveId(null);
            setOverId(null);
          }}
          onDragCancel={() => {
            setActiveId(null);
            setOverId(null);
          }}
        >
          <SortableContext
            items={steps.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {steps.map((step, index) => {
                const id = index.toString();
                const showIndicatorAbove =
                  activeId !== null && overId === id && activeId !== id;

                return (
                  <SortableStep
                    key={id}
                    id={id}
                    value={step}
                    showIndicatorAbove={showIndicatorAbove}
                    onChange={(v) => {
                      const next = [...steps];
                      next[index] = v;
                      setSteps(next);
                    }}
                    onRemove={() =>
                      setSteps(steps.filter((_, i) => i !== index))
                    }
                  />
                );
              })}
            </div>
          </SortableContext>

          {/* Drag overlay (smooth drop animation) */}
          <DragOverlay dropAnimation={dropAnimation}>
            {activeStep ? (
              <SortableStep
                id="overlay"
                value={activeStep}
                dragging
                showIndicatorAbove={false}
                onChange={() => {}}
                onRemove={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSteps([...steps, ""])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add step
        </Button>
      </CardContent>
    </Card>
  );
}
