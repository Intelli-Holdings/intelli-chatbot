"use client";

import React from "react";
import Dashboard from "../dashboard/main";
import { OnbordaProvider, Onborda, useOnborda } from "onborda";
import { steps } from "../../utils/tourSteps";
import CustomCard from "../CustomCard";

const DisableOnbordaAutoScroll: React.FC = () => {
  const { isOnbordaVisible } = useOnborda();
  const originalScrollIntoView = React.useRef<Element["scrollIntoView"] | null>(null);

  React.useEffect(() => {
    if (!isOnbordaVisible) {
      return;
    }

    if (!originalScrollIntoView.current) {
      originalScrollIntoView.current = Element.prototype.scrollIntoView;
    }

    // Prevent Onborda from auto-scrolling while the tour is visible.
    Element.prototype.scrollIntoView = function (
      ..._args: Parameters<Element["scrollIntoView"]>
    ) {
      return;
    };

    return () => {
      if (originalScrollIntoView.current) {
        Element.prototype.scrollIntoView = originalScrollIntoView.current;
      }
    };
  }, [isOnbordaVisible]);

  return null;
};

export function DashComponent() {

  return (
    <OnbordaProvider>
      <DisableOnbordaAutoScroll />
      <Onborda 
      steps={steps}
      shadowRgb="55,48,160"
      shadowOpacity="0.2"
      cardComponent={CustomCard}
      cardTransition={{ duration: 0.3, type: "tween" }}
      >
        <div className="space-y-8" id="onborda-step1">
          {/* Dashboard content */}
          <Dashboard />
        </div>
      </Onborda>
    </OnbordaProvider>
  );
}
