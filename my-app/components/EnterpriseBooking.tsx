"use client";

import React from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnterpriseBookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    (async function () {
      const cal = await getCalApi({ "namespace": "entreprise-sales" });
      cal("ui", {
        "cssVarsPerTheme": {
          "light": { "cal-brand": "#007fff" },
          "dark": { "cal-brand": "#007fff" }
        },
        "hideEventTypeDetails": false,
        "layout": "week_view"
      });
    })();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] p-0">
        <div className="relative h-[80vh] w-full">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </button>
          
          <Cal
            namespace="entreprise-sales"
            calLink="intelli/entreprise-sales"
            style={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              borderRadius: "var(--radius)",
            }}
            config={{
              layout: "month_view"
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnterpriseBookingModal;