import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Waitlist from '@/components/component/waitlist';

const PopupModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check how many times the user has visited the site
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);

    // Show the modal only if the user has visited fewer than 5 times
    if (visitCount < 5) {
      setIsOpen(true);
      localStorage.setItem('visitCount', (visitCount + 1).toString()); // Increment the visit count
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <Waitlist />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PopupModal;
