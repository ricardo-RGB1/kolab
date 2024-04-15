import { create } from 'zustand'; 


interface IProModal {
    isOpen: boolean; 
    onOpen: () => void;
    onClose: () => void;
}

/**
 * Custom hook for managing the pro modal state.
 * @param set - Function to update the state.
 * @returns An object containing the state and functions to manipulate it.
 */
export const useProModal = create<IProModal>((set) => ({
    isOpen: false, 
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}))