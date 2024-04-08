"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import { UserAvatar } from "./user-avatar";
import { connectionIdToColor } from "@/lib/utils";

const MAX_SHOWN_USERS = 2; // Maximum number of users to show in the participants list

export const Participants = () => {
  const users = useOthers(); // Get the list of other users
  const self = useSelf(); // Get the current user
  const showMoreUsers = users.length > MAX_SHOWN_USERS;

  return (
    <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md">
      <div className="flex gap-x-2">
        {/* Render the participants */}
        {users.slice(0, MAX_SHOWN_USERS).map(({ connectionId, info }) => {
          // Show only the first MAX_SHOWN_USERS users
          return (
            <UserAvatar
              borderColor={connectionIdToColor(connectionId)} // Assign a color based on the connection ID
              key={connectionId}
              src={info?.picture} // Show the user's picture
              name={info?.name}
              fallback={info?.name?.[0] || "A"} // Show the first letter of the user's name if the picture is not available
            />
          );
        })}
        {/* Render the current user */}
        {self && (
          <UserAvatar
            borderColor={connectionIdToColor(self.connectionId)}
            src={self.info?.picture} // Show the current user's picture
            name={`${self.info?.name} (You)`}
            fallback={self.info?.name?.[0]} // Show the first letter of the user's name
          />
        )}
        {/* Show the number of users if there are more than MAX_SHOWN_USERS */}
        {showMoreUsers && (
          <UserAvatar
            name={`${users.length - MAX_SHOWN_USERS} more`}
            fallback={`+${users.length - MAX_SHOWN_USERS}`} // Show the number of additional users
          />
        )}
      </div>
    </div>
  );
};

export const ParticipantsSkeleton = () => {
  return (
    <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md w-[100px]" />
  );
};
