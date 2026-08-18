"use client";

import { useState, FormEvent } from "react";
import { Send, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input, Select, Button } from "@/components/ui";
import { RESPONSE_TIME_CLAIM } from "@/config/offer";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const serviceOptions = [
  { value: "automation", label: "Process Automation" },
  { value: "development", label: "System Development" },
  { value: "ai", label: "AI Integration" },
  { value: "modernization", label: "Legacy Modernization" },
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
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-white dark:bg-gray-800 border border-[var(--border)] rounded-2xl",
        "p-8 md:p-10 shadow-lg",
        "before:absolute before:top-0 before:left-0 before:right-0 before:h-1",
        "before:bg-gradient-to-r before:from-brand-dark before:via-brand before:to-brand-light"
      )}
    >
      {/* Header */}
      <div className="mb-8">
        {/* §4 voice pass (Bundle V6): the prior "Send Us a Message" / "Fill out
            the form below and we'll get back to you shortly" predated the voice
            gate. This card stays a LIGHT card on the near-black band — see
            Contact.tsx — so it keeps its own light-surface foreground pairs
            rather than being re-tuned for dark. Two of those pairs DID change in
            this bundle: this sub-copy and the privacy note below both moved off
            `text-gray-500`, which measures 4.47:1 on the white card — under AA
            for 14px text. */}
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Write it out
        </h3>
        <p className="text-[0.95rem] text-gray-600 dark:text-gray-400">
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
              "w-full min-h-[130px] resize-y",
              "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl",
              "px-4 py-3 text-sm text-gray-900 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          />
        </div>

        {/* Submit */}
        <div className="mt-2">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
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
        <p className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <Lock className="w-4 h-4 stroke-brand" />
          Your information is secure and will never be shared.
        </p>
      </form>
    </div>
  );
}
