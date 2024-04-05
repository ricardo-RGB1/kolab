"use client";

import { useState, useEffect } from "react";

import { RenameModal } from "@/components/modals/rename-modal";

/**
 * Provides a modal component that solves for hydration mismatch errors in Next.js.
 * 
 * @returns The ModalProvider component.
 */
export const ModalProvider = () => {
    // Solve for hydration mismatch errors in Next.js
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null; // Return null if the component is not mounted.


    return (
        <>
            <RenameModal />
        </>
    );
};
