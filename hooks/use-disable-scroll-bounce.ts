import { useEffect } from "react";

/**
 * Custom hook to disable scroll bounce effect on the body element.
 */
export const useDisabledScrollBounce = () => {
  useEffect(() => {
    document.body.classList.add("overflow-hidden", "overscroll-none");
    return () => {
      document.body.classList.remove("overflow-hidden", "overscroll-none");
    };
  }, []);
};


// This hook is designed to disable the scroll bounce effect on the body element of the webpage. The scroll bounce effect is a visual feedback that user has reached an edge of the box.

// Inside the function, it adds two classes, "overflow-hidden" and "overscroll-none", to the body element of the document. The "overflow-hidden" class likely sets the CSS overflow property to hidden, which means the content is clipped and no scrollbars are provided. The "overscroll-none" class likely sets the CSS overscroll-behavior property to none, which means the scroll chaining and bounce effects are prevented.

// The useEffect hook also returns a cleanup function. This function is run before the component using the hook is removed from the UI to prevent memory leaks. In this case, the cleanup function removes the "overflow-hidden" and "overscroll-none" classes from the body element, effectively re-enabling the scroll bounce effect.

// he dependency array of the useEffect hook is empty, which means the effect runs once after the first render, and the cleanup runs once before the component is unmounted. This is similar to componentDidMount and componentWillUnmount in class components.