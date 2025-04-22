"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { useFloatingElement } from "@/hooks/floating-elements"
import { cn } from "@/lib/utils"
import { Button } from "./button" 

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
}: SelectProps) {
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value)
  const {
    triggerRef,
    showFloatingElement,
    hideFloatingElement,
    isShowing,
    updateTriggerRect
  } = useFloatingElement()

  // Update internal state when external value changes
  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  // Get the label of the currently selected option
  const selectedLabel = React.useMemo(() => {
    const selectedOption = options.find(option => option.value === selectedValue)
    return selectedOption ? selectedOption.label : placeholder
  }, [options, selectedValue, placeholder])

  const handleSelectClick = () => {
    if (disabled) return
    
    if (isShowing) {
      hideFloatingElement()
    } else {
      // Force update the trigger rect before showing the floating element
      setTimeout(() => {
        showFloatingElement(
          <div className={cn(
            "z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            contentClassName
          )}>
            <div className="max-h-[300px] overflow-auto">
              {options.map((option) => (
                <div 
                  key={option.value}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    option.disabled && "opacity-50 pointer-events-none",
                    itemClassName
                  )}
                  onClick={() => {
                    if (!option.disabled) {
                      setSelectedValue(option.value)
                      onValueChange?.(option.value)
                      hideFloatingElement()
                    }
                  }}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {selectedValue === option.value && <Check className="h-4 w-4" />}
                  </span>
                  {option.label}
                </div>
              ))}
            </div>
          </div>,
          { 
            matchWidth: true,
            side: 'bottom',
            align: 'start',
            offset: 4,
            fullScreenOverlay: true
          }
        )
      }, 0);
    }
  }

  // Close the select when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isShowing && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        hideFloatingElement()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isShowing, hideFloatingElement, triggerRef])

  return (
    <div className={cn("relative w-full", className)}>
      <Button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isShowing}
        disabled={disabled}
        className={cn(
          "w-full justify-between font-normal",
          disabled && "opacity-50 cursor-not-allowed",
          triggerClassName
        )}
        onClick={handleSelectClick}
      >
        {selectedLabel}
        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </Button>
    </div>
  )
}