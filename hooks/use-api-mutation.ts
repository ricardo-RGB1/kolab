import { useState } from 'react';
import { useMutation } from 'convex/react';

/**
 * Custom hook for performing API mutations.
 * @param mutationFunction The mutation function to be executed.
 * @returns An object containing the mutate function and a boolean indicating if a mutation is pending.
 */
export const useApiMutation = (mutationFunction: any) => {
    const [pending, setPending] = useState(false); 
    const apiMutation = useMutation(mutationFunction); // The useMutation hook from the convex library is used to create a new mutation.

    /**
     * Executes an API mutation with the given payload.
     * @param payload The payload for the mutation.
     * @returns A Promise that resolves to the result of the mutation.
     * @throws If an error occurs during the mutation.
     */
    const mutate = (payload: any) => { // The payload is the data that will be sent to the API.
        setPending(true); 
        return apiMutation(payload)
            .finally(() => setPending(false))
            .then((result) => {
                return result;
            })
            .catch((error) => {
                throw error;
            });
    }; 

    return { mutate, pending}; 
}