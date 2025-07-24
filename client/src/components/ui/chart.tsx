import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Chart Container
const ChartContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative w-full h-full", className)}
    {...props}
  />
));
ChartContainer.displayName = "ChartContainer";

// Chart Title
const ChartTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
ChartTitle.displayName = "ChartTitle";

// Chart Description
const ChartDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ChartDescription.displayName = "ChartDescription";

// Chart Content
const ChartContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full h-full", className)}
    {...props}
  />
));
ChartContent.displayName = "ChartContent";

// Chart Legend
const ChartLegend = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-center space-x-4 text-sm", className)}
    {...props}
  />
));
ChartLegend.displayName = "ChartLegend";

// Chart Legend Item
const ChartLegendItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    color?: string;
  }
>(({ className, color, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-2", className)}
    {...props}
  >
    {color && (
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
    )}
    <span>{children}</span>
  </div>
));
ChartLegendItem.displayName = "ChartLegendItem";

// Chart Tooltip
const ChartTooltip = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-background p-2 shadow-md",
      className
    )}
    {...props}
  />
));
ChartTooltip.displayName = "ChartTooltip";

// Chart Canvas (for Chart.js integration)
const ChartCanvas = forwardRef<
  HTMLCanvasElement,
  React.CanvasHTMLAttributes<HTMLCanvasElement>
>(({ className, ...props }, ref) => (
  <canvas
    ref={ref}
    className={cn("w-full h-full", className)}
    {...props}
  />
));
ChartCanvas.displayName = "ChartCanvas";

export {
  ChartContainer,
  ChartTitle,
  ChartDescription,
  ChartContent,
  ChartLegend,
  ChartLegendItem,
  ChartTooltip,
  ChartCanvas,
};
