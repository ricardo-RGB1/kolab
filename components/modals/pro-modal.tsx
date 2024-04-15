"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useProModal } from "@/store/use-pro-modal";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";

// Load the Poppins font from Google Fonts.
const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const ProModal = () => {
  // Desctructure the custom hook to get the isOpen, onClose, and initialValues properties.
  const { isOpen, onClose } = useProModal();

  // Use the pay action from the Stripe API.
  const pay = useAction(api.stripe.pay);

  const [pending, setPending] = useState(false);

  const { organization } = useOrganization();

  // Handle the click event for the upgrade button.
  const handleClick = async () => {
    if (!organization?.id) return;

    setPending(true);
    try {
      const redirectUrl = await pay({ orgId: organization.id });
      window.location.href = redirectUrl;
    } finally {
      setPending(false); // Set pending to false after the action is complete.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] p-0 overflow-hidden">
        <div className="aspect-video relative flex items-center justify-center">
          <Image
            src="/placeholders/upgrade.svg"
            alt="Upgrade to Pro"
            className="object-fit"
            fill
          />
        </div>
        <div
          className={cn(
            "text-neutral-700 mx-auto space-y-6 p-6",
            font.className
          )}
        >
          <h2 className="font-medium text-lg">Upgrade to Pro today! 🚀</h2>
          <div className="pl-3">
            <ul className="text-[12px] space-y-1 list-disc">
              <li>Unlimited boards</li>
              <li>Priority support</li>
              <li>Custom tools</li>
              <li>And more...</li>
            </ul>
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={handleClick}
            disabled={pending} // Disable the button when the action is pending; example is when the user is waiting for the checkout session to be created. 
          >
            Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// REMEMBER: When programmtically opening the modal with zustand, it will cause hydration mismatch errors in Next.js. Therefore, it is important to create a modal provider to handle the modal state.
