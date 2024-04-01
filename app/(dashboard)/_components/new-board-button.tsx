"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface NewBoardButtonProps {
  orgId: string;
  disabled?: boolean;
}

export const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
  const { mutate, pending } = useApiMutation(api.board.create);

  const onClick = () => {
    mutate({ orgId, title: "New board" })
      .then((id) => {
        toast.success("Board created!");
      })
      .catch(() => toast.error("Failed to create board"));
  };

  return (
    <button
      disabled={pending || disabled}
      onClick={onClick}
      className={cn(
        "col-span-1 aspect-[100/127] bg-yellow-200 rounded-lg hover:bg-yellow-400 flex flex-col items-center justify-center py-6",
        (pending || disabled) && "opacity-75 hover:bg-yellow-200 cursor-not-allowed"
      )}
    >
      <div />
      <Plus className="h-12 w-12 text-slate-900 stroke-1" />
      <p className="text-sm text-slate-900 font-light">Create board</p>
    </button>
  );
};
