// app/(auth)/verification/page.tsx
import { Suspense } from "react";
import LoadingPage from "@/components/loading-page";
import VerifyEmailClient from "./authentication";

export default function Page() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
