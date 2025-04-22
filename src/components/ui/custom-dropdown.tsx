"use client"

import * as React from "react"
import { useFloatingElement } from "@/hooks/floating-elements"
import { cn } from "@/lib/utils"

interface DropdownTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
}

type DropdownContextValue = {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined)

function useDropdownContext() {
  const context = React.useContext(DropdownContext)
  if (!context) {
    throw new Error("Dropdown components must be used within a DropdownMenu")
  }
  return context
}

export function CustomDropdownMenu({ children, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const {
    triggerRef,
    showFloatingElement,
    hideFloatingElement,
    isShowing,
  } = useFloatingElement()

  const toggle = React.useCallback(() => {
    if (isShowing) {
      hideFloatingElement()
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [hideFloatingElement, isShowing])

  const close = React.useCallback(() => {
    hideFloatingElement()
    setIsOpen(false)
  }, [hideFloatingElement])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, close, triggerRef])

  const value = React.useMemo(() => ({
    isOpen,
    toggle,
    close
  }), [isOpen, toggle, close])

  return (
    <DropdownContext.Provider value={value}>
      <div className={cn("relative inline-block", className)}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            if (child.type === CustomDropdownTrigger) {
              return React.cloneElement(child as React.ReactElement<any>, {
                ref: triggerRef,
                onClick: (e: React.MouseEvent) => {
                  child.props.onClick?.(e)
                  toggle()
                  
                  // If dropdown was closed and now opening
                  if (!isOpen) {
                    // We need a small delay to let the state update
                    setTimeout(() => {
                      // Find the content child
                      const contentChild = React.Children.toArray(children).find(
                        c => React.isValidElement(c) && c.type === CustomDropdownContent
                      )
                      
                      if (contentChild && React.isValidElement(contentChild)) {
                        showFloatingElement(
                          contentChild,
                          {
                            matchWidth: false,
                            side: 'bottom',
                            align: 'start',
                            offset: 4,
                            fullScreenOverlay: true
                          }
                        )
                      }
                    }, 0)
                  }
                }
              })
            }
            return null // Only render trigger here
          }
          return null
        })}
      </div>
    </DropdownContext.Provider>
  )
}

export const CustomDropdownTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownTriggerProps
>(({ className, asChild = false, ...props }, ref) => {
  const { isOpen } = useDropdownContext()
  
  return (
    <div
      ref={ref}
      role="button"
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    />
  )
})
CustomDropdownTrigger.displayName = "CustomDropdownTrigger"

export const CustomDropdownContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props} 
    />
  )
})
CustomDropdownContent.displayName = "CustomDropdownContent"

export const CustomDropdownItem = React.forwardRef<
  HTMLDivElement,
  DropdownItemProps
>(({ className, disabled, onClick, ...props }, ref) => {
  const { close } = useDropdownContext()
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(e)
    close()
  }
  
  return (
    <div
      ref={ref}
      role="menuitem"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
})
CustomDropdownItem.displayName = "CustomDropdownItem"