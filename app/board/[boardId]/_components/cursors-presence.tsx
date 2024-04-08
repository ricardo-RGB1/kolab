"use client";

import { memo } from "react";
import { useOthersConnectionIds } from "@/liveblocks.config";
import { Cursor } from "./cursor";


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
 * Renders the presence of cursors on the board.
 * @returns The CursorsPresence component.
 */
export const CursorsPresence = memo(() => {
    return (
        <>
            {/* TODO: Draft pencil */}
            <Cursors />
        </>
    );
});

CursorsPresence.displayName = "CursorPresence";
