import { useEffect, MutableRefObject } from 'react';

export const useFocusTrap = (
  ref: MutableRefObject<HTMLElement | null>,
  isActive: boolean
) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Auto focus the first element on mount
    if (firstElement) {
      firstElement.focus();
    }

    document.addEventListener('keydown', handleTabKeyPress);
    return () => {
      document.removeEventListener('keydown', handleTabKeyPress);
    };
  }, [isActive, ref]);
};
