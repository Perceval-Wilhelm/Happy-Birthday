"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/telemetry";
import "@/features/card/card.css";

// Replaces the root layout when it fails, so it brings its own <html> and styles.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportClientError(error, "boundary"), [error]);

  return (
    <html lang="vi">
      <body>
        <main className="notice">
          <h1>Ôi, lỗi mất rồi</h1>
          <p>Món quà bị kẹt một chút. Thử mở lại nha.</p>
          <button className="replay" type="button" onClick={reset}>
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
