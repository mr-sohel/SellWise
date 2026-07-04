import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-canvas-soft/80 border border-border/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
