"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
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
  // Use refs for DOM elements and state management
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const optionsContainerRef = React.useRef<HTMLDivElement | null>(null);
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<string | undefined>(value);
  
  // Sync with external value changes
  React.useEffect(() => {
    setSelectedOption(value);
  }, [value]);
  
  // Handle opening/closing the dropdown
  const toggleDropdown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (disabled) return;
    
    if (!isOpen) {
      setIsOpen(true);
      // Create the dropdown on open
      setTimeout(createDropdown, 10);
    } else {
      setIsOpen(false);
      destroyDropdown();
    }
  };
  
  // Handle selection of an option
  const handleSelect = React.useCallback((option: SelectOption) => {
    if (option.disabled) return;
    
    // Update internal state
    setSelectedOption(option.value);
    
    // Notify parent component
    if (onValueChange) {
      onValueChange(option.value);
    }
    
    // Close dropdown
    setIsOpen(false);
    destroyDropdown();
  }, [onValueChange]);
  
  // Clean up dropdown when component unmounts or dropdown closes
  const destroyDropdown = React.useCallback(() => {
    if (optionsContainerRef.current && document.body.contains(optionsContainerRef.current)) {
      document.body.removeChild(optionsContainerRef.current);
      optionsContainerRef.current = null;
    }
  }, []);
  
  React.useEffect(() => {
    return () => {
      destroyDropdown();
    };
  }, [destroyDropdown]);
  
  // Create dropdown options container and position it
  const createDropdown = React.useCallback(() => {
    // First, clean up any existing dropdown
    destroyDropdown();
    
    // Create new dropdown
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const container = document.createElement('div');
    
    // Style container
    container.style.position = 'absolute';
    container.style.top = `${buttonRect.bottom + window.scrollY + 4}px`;
    container.style.left = `${buttonRect.left + window.scrollX}px`;
    container.style.width = `${buttonRect.width}px`;
    container.style.zIndex = '9999';
    
    // Add classes for styling
    container.className = cn(
      "min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      contentClassName
    );
    
    // Render options
    const optionsDiv = document.createElement('div');
    optionsDiv.className = "max-h-[300px] overflow-auto";
    
    options.forEach(option => {
      const optionDiv = document.createElement('div');
      
      optionDiv.className = cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        option.disabled && "opacity-50 pointer-events-none",
        itemClassName
      );
      
      // Add check mark for selected option
      const checkSpan = document.createElement('span');
      checkSpan.className = "absolute left-2 flex h-3.5 w-3.5 items-center justify-center";
      if (selectedOption === option.value) {
        const checkIcon = document.createElement('div');
        checkIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        checkSpan.appendChild(checkIcon.firstChild as Node);
      }
      
      optionDiv.appendChild(checkSpan);
      optionDiv.appendChild(document.createTextNode(option.label));
      
      // Add click handler directly to the option element
      if (!option.disabled) {
        optionDiv.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSelect(option);
        });
      }
      
      optionsDiv.appendChild(optionDiv);
    });
    
    container.appendChild(optionsDiv);
    document.body.appendChild(container);
    optionsContainerRef.current = container;
    
    // Add global click handler to close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
  }, [contentClassName, destroyDropdown, handleSelect, itemClassName, options, selectedOption]);
  
  // Close dropdown when clicking outside
  const handleClickOutside = React.useCallback((event: MouseEvent) => {
    if (
      optionsContainerRef.current && 
      !optionsContainerRef.current.contains(event.target as Node) && 
      buttonRef.current && 
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      destroyDropdown();
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [destroyDropdown]);
  
  // Get selected label for display
  const selectedLabel = React.useMemo(() => {
    const found = options.find(option => option.value === selectedOption);
    return found ? found.label : placeholder;
  }, [options, selectedOption, placeholder]);
  
  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        className={cn(
          "w-full justify-between font-normal",
          disabled && "opacity-50 cursor-not-allowed",
          triggerClassName
        )}
        onClick={toggleDropdown}
      >
        {selectedLabel}
        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </Button>
    </div>
  );
}