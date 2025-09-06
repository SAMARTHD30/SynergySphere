"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "./badge";
import { Input } from "./input";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxItems?: number;
  allowCustom?: boolean;
}

export function MultiSelect({
  value = [],
  onChange,
  placeholder = "Add items",
  className,
  maxItems,
  allowCustom = true,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = React.useState("");

  const addItem = (item: string) => {
    const trimmedItem = item.trim();
    if (trimmedItem && !value.includes(trimmedItem) && (!maxItems || value.length < maxItems)) {
      onChange([...value, trimmedItem]);
      setInputValue("");
    }
  };

  const removeItem = (itemToRemove: string) => {
    onChange(value.filter(item => item !== itemToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(inputValue);
    }
  };

  const handleAddClick = () => {
    addItem(inputValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center space-x-1">
              <span>{item}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeItem(item)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      {allowCustom && (!maxItems || value.length < maxItems) && (
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddClick}
            size="sm"
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Max Items Message */}
      {maxItems && value.length >= maxItems && (
        <p className="text-sm text-muted-foreground">
          Maximum {maxItems} items allowed
        </p>
      )}
    </div>
  );
}
