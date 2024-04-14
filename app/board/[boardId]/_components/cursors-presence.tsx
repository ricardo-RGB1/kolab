"use client";

import { memo } from "react";
import { useOthersConnectionIds, useOthersMapped } from "@/liveblocks.config";
import { Cursor } from "./cursor";
import { shallow } from "@liveblocks/client";
import { Path } from "./path";
import { colorToCss } from "@/lib/utils";


// A Cursors component that returns the presence of other users' cursors. This component will not have props, but will use the useOthersConnectionIds hook to get the connection IDs of other users.
const Cursors = () => {
  const ids = useOthersConnectionIds();

  return (
    <>
      {ids.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
};



/**
 * Renders the presence of drafts on the board.
 * @returns The Drafts component.
 */
const Drafts = () => {
  const others = useOthersMapped((other) => ({
    pencilDraft: other.presence.pencilDraft, 
    penColor: other.presence.penColor,
  }), shallow); // Only re-render if the presence of other users changes

  return (
    <>
      {others.map(([key, other]) => {
        if(other.pencilDraft) {
          return (
            <Path
              key={key}
              x={0}
              y={0}
              points={other.pencilDraft}
              fill={other.penColor ? colorToCss(other.penColor) : "#000"}
            />
          )
        }

        return null; 
      })}
    </>
  )
}


/**
 * Renders the presence of cursors on the board.
 * @returns The CursorsPresence component.
 */
export const CursorsPresence = memo(() => {
    return (
        <>
        {/* // Renders the drafts of other users */}
            <Drafts /> 
            <Cursors /> 
        </>
    );
});

CursorsPresence.displayName = "CursorPresence";
