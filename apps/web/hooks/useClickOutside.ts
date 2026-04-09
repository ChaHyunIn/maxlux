import { useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

/**
 * Hook that triggers a callback when a click is detected outside of the referenced element.
 * 
 * @param ref - Ref to the element to watch for outside clicks
 * @param onOutsideClick - Callback function to execute when an outside click occurs
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutsideClick: () => void) {
    const stableCallback = useCallback(onOutsideClick, [onOutsideClick]);
    
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && (e.target instanceof Node) && !ref.current.contains(e.target)) {
                stableCallback();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref, stableCallback]);
}
