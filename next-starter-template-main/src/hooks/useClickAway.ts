import { useEffect, RefObject } from 'react';

/**
 * Hook to handle click-away and Escape key behavior for dropdowns/menus.
 * 
 * @param containerRef - Ref to the dropdown/menu container element
 * @param toggleRef - Ref to the toggle button element
 * @param onClose - Callback to close the dropdown
 * @param isOpen - Whether the dropdown is currently open
 */
export function useClickAway(
  containerRef: RefObject<HTMLElement | null>,
  toggleRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  isOpen: boolean
) {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking inside the container
      if (containerRef.current?.contains(target)) {
        return;
      }
      
      // Don't close if clicking the toggle button (let the toggle handler manage it)
      if (toggleRef.current?.contains(target)) {
        return;
      }
      
      // Click outside - close the dropdown
      onClose();
      
      // Return focus to toggle button
      if (toggleRef.current) {
        toggleRef.current.focus();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        
        // Return focus to toggle button
        if (toggleRef.current) {
          toggleRef.current.focus();
        }
      }
    };

    // Use pointerdown to avoid focus/click ordering issues
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, containerRef, toggleRef, onClose]);
}
