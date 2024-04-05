'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export const EmptyBoards = () => {
  const router = useRouter();
  const {organization} = useOrganization();

  const { mutate, pending } = useApiMutation(api.board.create);

  // Use the useMutation hook from the convex library to create a new mutation called create that calls the create method from the board API.
  const create = useMutation(api.board.create);

  const onClick = () => {
    if (!organization) return;

    // The mutate function is called with the payload containing the organization ID and the title of the new board.
    mutate({ 
      orgId: organization.id,
      title: 'New board'
    })
    .then((id) => { 
      toast.success('Board created successfully');
      router.push(`/board/${id}`); // Redirect to the new board
    })
    .catch((error) => {
      toast.error('Failed to create board');
    }); 
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image src="/createBoards.jpg" alt="Empty search" width={190} height={190} />
      <h2 className="text-2xl font-semibold mt-6">Create your first board!</h2>
      <p className="text-muted-foreground text-sm mt-2">
        Get started by creating your first board
      </p>
      <div className="mt-6">
        <Button disabled={pending} onClick={onClick} size='lg'>
          Create board
        </Button>
      </div>
    </div>
  );
};
