"use client"

import { useEffect } from 'react';

import { logger } from "@/lib/logger";
/**
 * Component to prevent body from getting stuck with pointer-events: none
 * This happens when Radix UI Dialog/Sheet doesn't clean up properly
 */
export function PointerEventsFix() {
  useEffect(() => {
    // Function to check and fix pointer-events on body
    const fixPointerEvents = () => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);

      // Check if body has pointer-events: none
      if (computedStyle.pointerEvents === 'none') {
        // Check if there are any open dialogs or sheets
        const hasOpenDialog = document.querySelector('[data-state="open"][role="dialog"]');
        const hasOpenSheet = document.querySelector('[data-state="open"][role="alertdialog"]');

        // If no open dialogs/sheets, remove the pointer-events restriction
        if (!hasOpenDialog && !hasOpenSheet) {
          logger.info('[PointerEventsFix] Removing stuck pointer-events: none from body');
          body.style.pointerEvents = '';
        }
      }
    };

    // Run check on mount
    fixPointerEvents();

    // Set up mutation observer to watch for changes
    const observer = new MutationObserver(() => {
      fixPointerEvents();
    });

    // Watch for attribute changes on body and dialog state changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
      subtree: true,
      childList: true,
    });

    // Also run check periodically as a safety net
    const interval = setInterval(fixPointerEvents, 1000);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}

export default PointerEventsFix;
