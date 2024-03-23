"use client";

import Image from "next/image";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";

interface ItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Renders a sidebar item.
 *
 * @param id The organization id
 * @param name The organization name
 * @param imageUrl The organization image url
 */
export const Item = ({ id, name, imageUrl }: ItemProps) => {
  const { organization } = useOrganization();
  const { setActive } = useOrganizationList();

  // Check if the organization is active
  const isActive = organization?.id === id;

  /**
   * Handles the click event for the sidebar item.
   */
  const onCllck = () => {
    if (!setActive) {
      // If setActive is not defined, return
      return;
    }
    setActive({ organization: id }); // Set the active organization
  };

  return (
    <div className="aspect-square relative">
      <Hint label={name} side="right" align="start" sideOffset={18}>
        <Image
          fill
          alt={name}
          src={imageUrl}
          onClick={onCllck}
          className={cn(
            "rounded-md cursor-pointer opacity-75 hover:opacity-100 transition",
            isActive && "opacity-100"
          )}
        />
      </Hint>
    </div>
  );
};
 