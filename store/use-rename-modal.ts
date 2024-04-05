import { create } from 'zustand'; 

const defaultValues = { id: "", title: ""}; 

interface RenameModal {
    isOpen: boolean; 
    initialValues: typeof defaultValues;
    onOpen: (id: string, title: string) => void;
    onClose: () => void;
}

/**
 * Custom hook for managing the rename modal state.
 * @param set - Function to update the state.
 * @returns An object containing the state and functions to manipulate it.
 */
export const useRenameModal = create<RenameModal>((set) => ({
    isOpen: false, 
    onOpen: (id, title) => set({ isOpen: true, initialValues: { id, title }}),
    onClose: () => set({ isOpen: false, initialValues: defaultValues}),
    initialValues: defaultValues,
}))