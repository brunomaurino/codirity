"use client";

import { useState, FormEvent } from "react";
import { Send, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input, Select, Button } from "@/components/ui";
import { audit, AUDIT_TURNAROUND } from "@/config/offer";
import { track } from "@/lib/analytics";

interface FormData {
  name: string;
  email: string;
  website: string;
  stage: string;
  message: string;
  fax: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  website: "",
  stage: "",
  message: "",
  fax: "",
};

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
];

/** The ad's UTM tags and click id, read off the landing URL at submit time so
 *  each request in the inbox says which keyword paid for it. */
function readAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export function AuditForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.website || !formData.stage) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // `stage` is a fixed enum from offer.ts — the only field that reaches
    // analytics. Name, email, site and message are personal data.
    const stage = formData.stage;
    track("audit_form_submitted", { stage });

    // Bounded reason code, never the display message (see ContactForm).
    let reason = "network_error";

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, attribution: readAttribution() }),
      });

      reason = response.ok ? "malformed_response" : `http_${response.status}`;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send your request");
      }

      track("audit_form_success", { stage });
      setSentTo(formData.email);
      setFormData(initialFormData);
    } catch (error) {
      track("audit_form_error", { stage, reason });
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // A paid click is expensive: once the request is in, the form gives way to a
  // plain confirmation instead of resetting to an empty form that invites a
  // second, duplicate submit.
  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <CheckCircle2 className="h-8 w-8 stroke-mint" aria-hidden="true" />
        <h3 className="display d-md">Got it.</h3>
        <p className="lede">
          The report goes to {sentTo} within {AUDIT_TURNAROUND}. If anything is
          unclear about the site, we&apos;ll ask by email first.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h3 className="label" style={{ marginBottom: "10px" }}>
          {audit.formTitle}
        </h3>
        <p className="lede">{audit.formLede}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Your site *"
          name="website"
          placeholder="acme.com"
          inputMode="url"
          autoComplete="url"
          value={formData.website}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Name *"
            name="name"
            placeholder="Jane Doe"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Work email *"
            name="email"
            type="email"
            placeholder="jane@acme.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <Select
          label="Company stage *"
          name="stage"
          placeholder="Select one"
          options={audit.stages}
          value={formData.stage}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />

        <div className="w-full">
          <label htmlFor="message" className="field-label">
            Anything worrying you? (optional)
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="A page that stopped ranking, a checkout that feels off…"
            value={formData.message}
            onChange={handleChange}
            maxLength={2000}
            disabled={isSubmitting}
            className="field min-h-[110px] resize-y"
          />
        </div>

        {/* Honeypot: off-screen and out of the tab order, so only a bot fills it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="fax">Fax</label>
          <input
            id="fax"
            name="fax"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.fax}
            onChange={handleChange}
          />
        </div>

        <div className="mt-2">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting} variant="mint">
            {isSubmitting ? (
              <>
                Sending...
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <>
                {audit.cta}
                <Send className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>

        <p className="flex items-center justify-center gap-2 mt-4 text-sm text-chalk-dim">
          <Lock className="w-4 h-4 stroke-mint" />
          We use your details for this audit only. No mailing list.
        </p>
      </form>
    </div>
  );
}
