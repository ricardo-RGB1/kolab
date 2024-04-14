"use client";

import { LucideIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolButtonProps {
  label: string;
  icon: LucideIcon;
  iconX?: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

export const ToolButton = ({
  label,
  icon: Icon,
  iconX: IconX,
  onClick,
  isActive,
  isDisabled,
}: ToolButtonProps) => {
  return (
    <Hint label={label} side='right' sideOffset={14}>
        <Button 
            disabled={isDisabled}
            onClick={onClick}
            size='icon'
            variant={isActive ? "boardActive" : "board"}
        >
              <div style={{position: 'relative'}}>
                <Icon />
                {IconX && <IconX style={{position: 'absolute', top: 0, left: 0}} />}
            </div>
        </Button>
    </Hint>
    );
};
