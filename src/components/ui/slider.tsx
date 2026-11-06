"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  "children"
> & {
  className?: string;
};

function Slider({ className, ...props }: SliderProps) {
  const values = (Array.isArray(props.value)
    ? props.value
    : Array.isArray(props.defaultValue)
      ? props.defaultValue
      : [props.value ?? props.defaultValue ?? 0]) as readonly number[];

  return (
    <SliderPrimitive.Root
      {...props}
      className={cn("w-full", className)}
    >
      <SliderPrimitive.Control className="flex items-center py-3 w-full touch-none select-none">
        <SliderPrimitive.Track className="relative bg-muted rounded-full w-full h-1.5">
          <SliderPrimitive.Indicator className="absolute bg-primary rounded-full h-full" />
          {values.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              index={index}
              aria-label={
                values.length > 1
                  ? index === 0
                    ? "Minimum price"
                    : "Maximum price"
                  : "Price"
              }
              className="block bg-background shadow-sm border-2 border-primary rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring/30 size-5 transition"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
