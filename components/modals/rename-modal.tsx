"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogClose,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRenameModal } from "@/store/use-rename-modal";
import { useState, useEffect, FormEventHandler } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export const RenameModal = () => {
 const { mutate, pending } = useApiMutation(api.board.update);


  // Desctructure the custom hook to get the isOpen, onClose, and initialValues properties.
  const { isOpen, onClose, initialValues } = useRenameModal();
  // Create a state for the title of the board.
  const [title, setTitle] = useState(initialValues.title);

  useEffect(() => {
    setTitle(initialValues.title);
  }, [initialValues.title]);



/**
 * Handles the form submission for updating the board title.
 * @param {React.FormEvent<HTMLFormElement>} e - The form event.
 */
const onSubmit: FormEventHandler<HTMLFormElement> = (
    e,
) => { 
    e.preventDefault(); 
    mutate({ id: initialValues.id, title }) //ID of the board to be updated.
    .then(() => {
        toast.success("Board title updated");
        onClose();
    })
    .catch(() => toast.error("Failed to update board title"));
};



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit board title</DialogTitle>
        </DialogHeader>
        <DialogDescription>Enter a new title for this board</DialogDescription>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            disabled={pending}
            required
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a new title for this board"
          />
          <DialogFooter>
            <DialogClose asChild>
                <Button type='button' variant='outline'>Cancel</Button>
            </DialogClose>
            <Button disabled={pending} type='submit'>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// REMEMBER: When programmtically opening the modal with zustand, it will cause hydration mismatch errors in Next.js. Therefore, it is important to create a modal provider to handle the modal state.
