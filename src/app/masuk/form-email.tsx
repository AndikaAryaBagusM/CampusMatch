"use client";

import { useActionState } from "react";
import { masukEmail } from "./actions";

export function FormEmail({ callbackUrl }: { callbackUrl: string }) {
  const [status, action, pending] = useActionState(masukEmail, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        maxLength={254}
        autoComplete="email"
        placeholder="nama@email.com"
        aria-describedby={status ? "email-pesan" : undefined}
        className="h-11 w-full rounded-lg border border-input bg-white px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {status ? (
        <p id="email-pesan" role="alert" className="text-sm text-destructive">
          {status.pesan}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-brand-deep disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim tautan masuk"}
      </button>
    </form>
  );
}
