"use client";

import { useState, FormEvent } from "react";
import { Send, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input, Select, Button } from "@/components/ui";
import { RESPONSE_TIME_CLAIM, included } from "@/config/offer";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// COMPOSED from offer.ts, not written here. These were four invented category
// names — "Process Automation", "System Development", "AI Integration",
// "Legacy Modernization" — none of which appear anywhere in offer.ts. W6
// deleted the identical four strings from the footer as a fabrication, and
// leaving them in the form on the SAME screen would have applied that ruling to
// one element and not the one beside it (Phase 4/5 review).
//
// The value is a stable slug so the API and any saved submissions keep working;
// only the LABEL changes, and it now traces to `included[]`.
const serviceOptions = [
  ...included.map((label) => ({
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    label,
  })),
  { value: "other", label: "Other / Not Sure" },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  service: "",
  message: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // The only field forwarded to analytics is the service dropdown — a fixed
    // enum. Name, email, company, and the message body are personal data and
    // never leave the request.
    const service = formData.service || "unspecified";
    track("contact_form_submitted", { service });

    // A bounded reason code for analytics — deliberately NOT the user-facing
    // error message. That message is display copy (locale-dependent for network
    // failures), and if the API ever echoed submitted input back in an error it
    // would otherwise flow straight into the analytics payload unnoticed.
    let reason = "network_error";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      reason = response.ok ? "malformed_response" : `http_${response.status}`;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Fires only after the API accepted it — this is the event that counts a
      // captured lead, as distinct from an attempt.
      track("contact_form_success", { service });
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData(initialFormData);
    } catch (error) {
      // A silent delivery failure loses a lead, so failures are measured too —
      // carrying `service` like its sibling events so the funnel stays joinable.
      track("contact_form_error", { service, reason });
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Part of the closing band, not a card floating on it. This was the last
    // v3 surface on the site: a white card with a shadow and the v3 green
    // gradient accent bar that globals.css explicitly says never to
    // reintroduce — and it put a SECOND action green (bg-brand-fill) directly
    // beside the mint close CTA. The fields are ruled now, the same vocabulary
    // as the terms band and the services list.
    <div>
      {/* Header */}
      <div className="mb-8">
        {/* §4 voice pass (Bundle V6): the prior "Send Us a Message" / "Fill out
            the form below and we'll get back to you shortly" predated the voice
            gate. Foregrounds are now the dark-ground pairs, since the card
            became part of the band. */}
        <h3 className="label" style={{ marginBottom: "10px" }}>
          Write it out
        </h3>
        <p className="lede">
          A paragraph is plenty. {RESPONSE_TIME_CLAIM}.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="First Name *"
            name="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Last Name *"
            name="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address *"
          name="email"
          type="email"
          placeholder="john@company.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />

        {/* Company & Service Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Company Name"
            name="company"
            placeholder="Your Company"
            value={formData.company}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <Select
            label="Service Interested In"
            name="service"
            placeholder="Select a service"
            options={serviceOptions}
            value={formData.service}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Message */}
        <div className="w-full">
          <label
            htmlFor="message"
            className="field-label"
          >
            How Can We Help? *
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us about your project, challenges, or goals..."
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className={cn(
              // Same ruled field as Input/Select — see `.field`.
              "field min-h-[130px] resize-y"
            )}
          />
        </div>

        {/* Submit */}
        <div className="mt-2">
          {/* Mint, like the address CTA beside it: §1.2 reserves mint for
              live/interactive elements, and a form's submit is exactly that.
              This replaces `bg-brand-fill` (#127A44) — a second, older action
              green that was visible at the same time as the mint one. */}
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting} variant="mint">
            {isSubmitting ? (
              <>
                Sending...
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <>
                Send Message
                <Send className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="flex items-center justify-center gap-2 mt-4 text-sm text-chalk-dim">
          <Lock className="w-4 h-4 stroke-mint" />
          Your information is secure and will never be shared.
        </p>
      </form>
    </div>
  );
}
