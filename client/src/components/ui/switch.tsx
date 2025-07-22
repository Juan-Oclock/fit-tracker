import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFD300] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#FFD300] data-[state=unchecked]:bg-transparent",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* ON text - visible when checked */}
    <span 
      className={cn(
        "absolute left-2 text-xs font-bold transition-opacity",
        props.checked ? "opacity-100 text-black" : "opacity-0 text-white"
      )}
    >
      ON
    </span>
    
    {/* OFF text - visible when unchecked */}
    <span 
      className={cn(
        "absolute right-2 text-xs font-bold transition-opacity",
        props.checked ? "opacity-0 text-black" : "opacity-100 text-white"
      )}
    >
      OFF
    </span>
    
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-sm transition-transform will-change-transform data-[state=checked]:translate-x-8 data-[state=unchecked]:translate-x-1"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
