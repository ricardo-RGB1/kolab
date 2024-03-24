import Image from "next/image";

export const EmptyFavorites = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image src="/no-favorites.jpg" alt="Empty search" width={200} height={200} />
      <h2 className="text-2xl font-semibold mt-6">No favorite boards</h2>
      <p className="text-muted-foreground text-sm mt-2">
        Try favoriting a board to see it here
      </p>
    </div>
  );
};
