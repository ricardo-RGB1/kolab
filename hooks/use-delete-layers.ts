import { useSelf, useMutation } from "@/liveblocks.config";



/**
 * Custom hook for deleting layers from the selection.
 * @returns {void}
 */
export const useDeleteLayers = () => {
    const selection = useSelf((me) => me.presence.selection); // get the selection from the current user's presence

    return useMutation((
        { storage, setMyPresence}
    ) => { 
        const liveLayers = storage.get("layers");
        const liveLayerIds = storage.get("layerIds");

        for (const id of selection) {
            liveLayers.delete(id);
            
            const index = liveLayerIds.indexOf(id);

            if(index !== -1) {
                liveLayerIds.delete(index);
            }
        }

    setMyPresence({ selection: [] }, {addToHistory: true})

    }, [selection])
}

// in the above code useMutation returns a function that takes an object with storage and setMyPresence as arguments. The function deletes the selected layers from the storage object and updates the presence of the current user to remove the selection. The function is then returned from the useDeleteLayers hook.