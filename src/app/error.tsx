"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/telemetry";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportClientError(error, "boundary"), [error]);

  return (
    <main className="notice">
      <h1>Ôi, lỗi mất rồi</h1>
      <p>Món quà bị kẹt một chút. Thử mở lại nha.</p>
      <button className="replay" type="button" onClick={reset}>
        Thử lại
      </button>
    </main>
  );
}
