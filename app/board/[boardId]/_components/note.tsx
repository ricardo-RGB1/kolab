import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { NoteLayer } from "@/types/canvas";
import { cn, colorToCss, getContrastingTextColor } from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";


const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});



/**
 * Calculates the font size based on the width and height of the text container.
 * The font size is determined by taking the minimum value between the font size based on the height,
 * the font size based on the width, and the maximum font size.
 * 
 * @param width - The width of the text container.
 * @param height - The height of the text container.
 * @returns The calculated font size.
 */
const calculateFontSize = (width: number, height: number) => {
    const maxFontSize = 95;
    const scaleFactor = 0.15; 
    const fontSizeBasedOnHeight = height * scaleFactor; 
    const fontSizeBasedOnWidth = width * scaleFactor;

    return Math.min(
        fontSizeBasedOnHeight,
        fontSizeBasedOnWidth,
        maxFontSize
    )
}


interface NoteProps {
    id: string;
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}


export const Note = ({
    layer, 
    onPointerDown, 
    id,
    selectionColor
}: NoteProps) => {
    // destructuring the layer object
    const { x, y, width, height, fill, value } = layer;

    
    /**
     * Updates the value of a text layer.
     * 
     * @param {Object} storage - The storage object.
     * @param {string} newValue - The new value of the text.
     */
    const updateValue = useMutation((
        { storage },
        newValue: string // the new value of the text
     ) => {
        // get the layers from the storage
        const liveLayers = storage.get('layers'); 

        // Set the new value of the text layer with the given ID to the new value using the set method
        liveLayers.get(id)?.set('value', newValue);
    }, []); 


    // Handle the change event of the content editable element in a const named handleTextChange
    const handleTextChange = (e: ContentEditableEvent) => {
        // Call the updateValue function with the new value of the text
        updateValue(e.target.value);
    }


    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: selectionColor ? `2px solid ${selectionColor}` : "none",
                backgroundColor: fill ? colorToCss(fill) : "#000"
            }}
            className="shadow-md drop-shadow-xl"
        > 
            <ContentEditable
                html={value || ""}
                onChange={handleTextChange}
                className={cn("h-full w-full flex items-center justify-center text-center outline-none",
                font.className)}
                style={{
                    fontSize: calculateFontSize(width, height),
                    color: fill ? getContrastingTextColor(fill) : "#000",
                }}
            />
        </foreignObject>
    )
}