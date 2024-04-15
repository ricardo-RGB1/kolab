"use client";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { Banknote, Heart, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export const OrgSidebar = () => {
  const searchParams = useSearchParams();
  const favorites = searchParams.get("favorites");

  const { organization } = useOrganization();

  // Check if the user is subscribed to the organization by calling the getIsSubscribed query from the subscriptions API
  const isSubscribed = useQuery(api.subscriptions.getIsSubscribed, {
    orgId: organization?.id,
  });

  /** Logic to handle the upgrade to pro button
    Call the portal from the stripe API to create a billing portal session
    Create a new action to pay for the subscription
    Create a state to track if the payment is pending
    Create an onClick method to redirect the user to the sign up for pro page
   */
  const portal = useAction(api.stripe.portal);
  const pay = useAction(api.stripe.pay);
  const [pending, setPending] = useState(false);
  const onClick = async () => {
    if (!organization?.id) return;

    setPending(true);

    try {
      const action = isSubscribed ? portal : pay;
      const redirectUrl = await action({
        orgId: organization.id,
      });

      window.location.href = redirectUrl;
    } catch {
      toast.error("An error occurred"); 
    } finally {
      setPending(false);
    }
  };


  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
      <Link href="/">
        <div className="flex items-center gap-x-2">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <span
            className={cn(
              "font-semibold text-xl text-[#101820]",
              font.className
            )}
          >
            kolab
          </span>
          {/* If the user is subscribed, display the "pro" badge */}
          {isSubscribed && <Badge variant="secondary">Pro</Badge>}
        </div>
      </Link>
      <OrganizationSwitcher
        hidePersonal
        appearance={{
          elements: {
            rootBox: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            },
            organizationSwitcherTrigger: {
              padding: "6px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              justifyContent: "space-between",
              backgroundColor: "white",
            },
          },
        }}
      />
      <div className="space-y-1 w-full">
        <Button
          variant={favorites ? "ghost" : "secondary"}
          asChild
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Link href="/">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Team boards
          </Link>
        </Button>
        <Button
          variant={favorites ? "secondary" : "ghost"}
          asChild
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Link
            href={{
              pathname: "/",
              query: { favorites: true },
            }}
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </Link>
        </Button>
        <Button
          onClick={onClick}
          disabled={pending}
          variant="ghost"
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Banknote className="h-4 w-4 mr-2" />
          {isSubscribed ? "Payment Settings" : "Upgrade to Pro"}
        </Button>
      </div>
    </div>
  );
};
