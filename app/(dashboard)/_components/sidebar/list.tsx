'use client';

import { useOrganizationList } from "@clerk/nextjs";
import { Item } from "./item";

export const List = () => {
    const { userMemberships } = useOrganizationList({
        userMemberships: {
            infinite: true,
        }
    });

    // userMemberships.data is an array of organizations
    if(!userMemberships.data?.length) { 
        return null;
    }

    return (
        <ul className="space-y-4">
            {/* Render a list of organizations */}
            {userMemberships.data?.map((membership) => (
                <Item 
                    key={membership.organization.id}
                    id={membership.organization.name}
                    name={membership.organization.name}
                    imageUrl={membership.organization.imageUrl}
                /> 
            ))}
        </ul>
         
    )
}