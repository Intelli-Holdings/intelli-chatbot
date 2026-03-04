import { Suspense } from "react";
import { CheckoutPage } from "./CheckoutPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <CheckoutPage />
    </Suspense>
  );
}
