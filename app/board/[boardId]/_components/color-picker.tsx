"use client";

import { cn, colorToCss } from "@/lib/utils";
import { Color } from "@/types/canvas";

interface ColorPickerProps {
  onChange: (color: Color) => void; // This is a function that takes a Color as an argument and returns void
}

export const ColorPicker = ({ onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-wrap gap-2 items-center max-w-[164px] pr-2 mr-2 border-r border-neutral-200">
        <ColorButton
          onClick={onChange}
          color={{
            r: 255,
            g: 117,
            b: 20,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 252,
            g: 243,
            b: 95,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 0,
            g: 175,
            b: 255,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 145,
            g: 95,
            b: 109,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 195,
            g: 166,
            b: 235,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 210,
            g: 125,
            b: 45,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 255,
            g: 25,
            b: 25,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 80,
            g: 210,
            b: 120,
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <ColorButton
          isWhite={true}
          onClick={onChange}
          color={{
            r: 255,
            g: 255,
            b: 255,
          }}
        />
        <ColorButton
          onClick={onChange}
          color={{
            r: 0,
            g: 0,
            b: 0,
          }} 
        /> 
      </div>
    </div>
  );
};

/**
 * The props for the ColorButton component.
 * @param onClick - The function to call when the button is clicked.
 * @param color - The color of the button.
 * @param isWhite - Whether the button is white.
 * @returns The ColorButton component.
 */

interface ColorButtonProps {
  onClick: (color: Color) => void; // func takes a Color returns nothing
  color: Color;
  isWhite?: boolean;
}

// ColorButton will be used in the ColorPicker component above
const ColorButton = ({ onClick, color, isWhite }: ColorButtonProps) => {
  return (
    <button
      className="w-8 h-10 items-center flex justify-center hover:opacity-75 transition"
      onClick={() => onClick(color)}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full",
          isWhite ? "border-2 border-neutral-200" : ""
        )}
        style={{
          background: colorToCss(color),
        }}
      />
    </button>
  );
};

// In the ColorPicker component, the onChange prop is being passed down to the ColorButton component's onClick prop.

// This means that when the ColorButton is clicked, it will trigger whatever function was passed to the ColorPicker as the onChange prop.

// Here's a step-by-step explanation:

// The parent component that uses ColorPicker passes a function as the onChange prop. This function defines what should happen when the color changes.

// The ColorPicker component receives this function as a prop and passes it down to the ColorButton component.

// The ColorButton component receives this function as the onClick prop. This means that when the button is clicked, it will trigger the onChange function that was originally passed to the ColorPicker.

// This is a common pattern in React called "lifting state up". It allows parent components to control the state of child components and respond to changes in their state.
