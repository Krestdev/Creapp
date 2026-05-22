"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { cn } from "@/lib/utils";

function progressTrackStyle(
  value?: number | null,
): HTMLDivElement["className"] {
  if (!value || value < 50) return "bg-red-500";
  if (value === 50) return "bg-amber-500";
  if (value < 100) return "";
  return "bg-green-500";
}

function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-nowrap gap-1.5 items-center normal-case", className)}
      {...props}
    >
      <ProgressTrack className={"min-w-20"}>
        <ProgressIndicator className={progressTrackStyle(value)} />
      </ProgressTrack>
      <div className="flex flex-row gap-2">{children}</div>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "bg-muted h-1.5 rounded-full relative flex w-full items-center overflow-x-hidden",
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("bg-primary h-full transition-all", className)}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-xs font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "text-muted-foreground ml-auto text-xs tabular-nums",
        className,
      )}
      data-slot="progress-value"
      {...props}
    />
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
