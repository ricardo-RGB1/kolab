'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOrganization } from "@clerk/nextjs";


export const EmptyBoards = () => {
  const {organization} = useOrganization();

  // Use the useMutation hook from the convex library to create a new mutation called create that calls the create method from the board API.
  const create = useMutation(api.board.create);

  const onClick = () => {
    if (!organization) return;

    create({
      orgId: organization.id,
      title: 'New board'
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
        <Button onClick={onClick} size='lg'>
          Create board
        </Button>
      </div>
    </div>
  );
};
