import { Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalPopupButton, TrackedLink } from "@/components/ui";

const CAL_LINK = "support-codirity-lz8rjc/30min";

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

const contactMethods: ContactMethod[] = [
  {
    icon: <Mail className="w-[22px] h-[22px] stroke-white" />,
    title: "Email Us",
    content: (
      <TrackedLink
        href="mailto:support@codirity.com"
        event="email_click"
        eventParams={{ location: "contact_section" }}
        className="text-brand font-semibold hover:text-brand-dark transition-colors"
      >
        support@codirity.com
      </TrackedLink>
    ),
  },
  {
    icon: <MapPin className="w-[22px] h-[22px] stroke-white" />,
    title: "Based In",
    content: <span>Available worldwide, remote-first</span>,
  },
  {
    icon: <Clock className="w-[22px] h-[22px] stroke-white" />,
    title: "Response Time",
    content: <span>We respond within 24 hours</span>,
  },
];

export function ContactInfo() {
  return (
    <div className="lg:sticky lg:top-[120px]">
      <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Let&apos;s Build Something Great Together
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
        Ready to transform your business with AI-powered solutions? Get in touch
        and let&apos;s discuss how we can help you modernize your processes.
      </p>

      {/* Contact Methods */}
      <div className="flex flex-col gap-6 mb-10">
        {contactMethods.map((method, index) => (
          <div key={index} className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 flex-shrink-0",
                "bg-gradient-to-br from-brand to-brand-light",
                "rounded-xl flex items-center justify-center",
                "shadow-brand"
              )}
            >
              {method.icon}
            </div>
            <div>
              <h4 className="text-[0.95rem] font-semibold text-gray-900 dark:text-white mb-1">
                {method.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{method.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Call Box */}
      <div
        className={cn(
          "relative overflow-hidden",
          "bg-gradient-to-br from-brand-dark to-[#1a5a1d]",
          "rounded-[20px] p-8 text-white",
          "before:absolute before:-top-1/2 before:-right-1/2",
          "before:w-[150%] before:h-[150%]",
          "before:bg-[radial-gradient(circle,rgba(89,243,89,0.15)_0%,transparent_50%)]",
          "before:pointer-events-none"
        )}
      >
        <h4 className="text-xl font-bold mb-2 relative z-[1]">
          Prefer a Live Conversation?
        </h4>
        <p className="text-sm opacity-85 mb-6 relative z-[1]">
          Book a free 30-minute consultation call to discuss your project
          requirements and how we can help.
        </p>
        <CalPopupButton
          calLink={CAL_LINK}
          className={cn(
            "inline-flex items-center gap-3",
            "px-6 py-3 rounded-full",
            "bg-white text-brand-dark font-bold",
            "hover:-translate-y-0.5 hover:shadow-lg",
            "transition-all duration-300",
            "relative z-[1]"
          )}
        >
          Book a Call
          <ArrowRight className="w-[18px] h-[18px]" />
        </CalPopupButton>
      </div>
    </div>
  );
}
