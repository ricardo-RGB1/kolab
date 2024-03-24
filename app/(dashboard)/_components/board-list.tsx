"use client";

import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";

interface BoardListProps {
  orgId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}; 

/**
 * A component that renders a list of boards.
 * @param orgId - The ID of the organization.
 * @param query - The query parameters.
 * @returns The rendered BoardList component.
 */
export const BoardList = ({ orgId, query }: BoardListProps) => {
  const data = []; // Fetch data from the API.

  // If there is no data and a search query is present, display a message.
  if(!data?.length && query.search) {
    return (
        <EmptySearch />
    )
  }

  // If there is no data and the favorites query is present, display a message.
  if(!data?.length && query.favorites) {
    return (
      <EmptyFavorites /> 
    )
  }

  if(!data?.length) {
    return (
     <EmptyBoards />
    )
  }

  return (
    <div>
        {JSON.stringify(query)}
    </div>
    );
};
