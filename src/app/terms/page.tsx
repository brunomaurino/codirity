import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TrackedLink } from "@/components/ui";
import {
  CONTACT_EMAIL,
  foundingRate,
  guarantee,
  LEGAL_ENTITY,
  notIncluded,
  tiers,
} from "@/config/offer";

// ─────────────────────────────────────────────────────────────────────────────
// TODO (Bruno, BEFORE this page is treated as binding): fill this in.
// It is the ONLY fact on this page that is not derivable from the repo — the
// legal entity comes from offer.ts (LEGAL_ENTITY) and everything else reads from
// offer.ts or restates published policy. Rendered as a visible bracketed
// placeholder on purpose: a wrong jurisdiction is worse than an obvious blank,
// and Stripe's Customer-portal config only needs the URL to resolve, not this
// string.
const GOVERNING_LAW = "[STATE / COUNTRY OF GOVERNING LAW]";
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  // "Terms of Service" only — the root layout's title.template ("%s | Codirity")
  // adds the brand suffix, so a literal "... | Codirity" here would double it.
  title: "Terms of Service",
  description:
    "The terms that govern Codirity subscriptions: scope of work, delivery, billing, pausing and cancellation, ownership, and liability.",
  alternates: { canonical: "/terms" },
};

/** Section 13 commits us to updating THIS date when the terms change. */
const EFFECTIVE_DATE = "August 25, 2026";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ink-dim hover:text-brand transition-colors duration-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 tracking-tight mb-6">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-20 md:pb-28 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 text-gray-600">
            {/* Section 1 - Agreement */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                1. Agreement
              </h2>
              <div className="space-y-4">
                <p>
                  These Terms of Service (&quot;<strong className="text-gray-900">Terms</strong>&quot;) govern your use of the services provided by {LEGAL_ENTITY} (&quot;<strong className="text-gray-900">Codirity</strong>&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) through https://codirity.com and any subscription purchased there (the &quot;<strong className="text-gray-900">Service</strong>&quot;).
                </p>
                <p>
                  By starting a subscription, you (&quot;<strong className="text-gray-900">Client</strong>&quot;, &quot;you&quot;) accept these Terms. Together with our{" "}
                  <Link href="/privacy" className="text-brand hover:underline">
                    Privacy Policy
                  </Link>
                  , they form the entire agreement between you and Codirity.
                </p>
                <p>
                  If you are entering into these Terms on behalf of a company, you represent that you are authorized to bind that company, and &quot;you&quot; refers to that company.
                </p>
              </div>
            </div>

            {/* Section 2 - The Service */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                2. The Service
              </h2>
              <div className="space-y-4">
                <p>
                  Codirity is a monthly software-engineering subscription. You add requests to a private board; we deliver them one at a time (or in parallel, depending on your plan) until you pause or cancel. There is no contract term, no minimum commitment, and no per-project quote.
                </p>
                <p>
                  Each plan sets how many tasks are <em>active</em> at once, not how many you may request. Requests behind the active ones are unlimited and stay queued in the order you set.
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  {tiers.map((tier) => (
                    <p key={tier.id}>
                      <strong className="text-gray-900">
                        {tier.name} — {tier.price}
                        {tier.period}
                      </strong>
                      : {tier.tasks}. Unlimited requests and unlimited revisions.
                    </p>
                  ))}
                  {foundingRate.active && (
                    <p>
                      <strong className="text-gray-900">
                        Founding rate — {foundingRate.price}
                      </strong>
                      : available to the first {foundingRate.slots} subscriptions. The rate is held for as long as that subscription stays active and uninterrupted; the scope of work is identical to the Standard plan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3 - Scope of work */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                3. Scope of work
              </h2>
              <div className="space-y-4">
                <p>
                  A task is a unit of work we can ship in roughly one to two days — an automation, an AI integration, an API connection, a scraper, a dashboard view, a landing page, a web feature, or a bug fix. Larger projects are in scope: we break them down on our end and deliver progress every 24&ndash;48 hours until they are done.
                </p>
                <p>
                  The following are <strong className="text-gray-900">outside</strong> the subscription and are not delivered under these Terms:
                </p>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <ul className="list-disc pl-5 space-y-2">
                    {notIncluded.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  We may decline a request that falls outside this scope, that we judge unsafe or unlawful, or that we cannot maintain. If we decline, we say so in the card and you keep the slot for another request.
                </p>
              </div>
            </div>

            {/* Section 4 - Delivery */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                4. Delivery and revisions
              </h2>
              <div className="space-y-4">
                <p>
                  Average delivery is two to three business days per task; complex tasks take longer and we tell you so in the card upfront. We work asynchronously from GMT&minus;3. Every delivery ships with a short written or recorded summary of what changed and how to use it.
                </p>
                <p>
                  Delivered work lands in review on your board. Comment there to request changes — revisions are unlimited and are not counted against your active-task limit until you accept the work.
                </p>
                <p>
                  <strong className="text-gray-900">Delivery times are targets, not deadlines.</strong> The subscription does not include fixed-date commitments, and no delivery estimate in a card, an email, or on our website is a contractual deadline.
                </p>
              </div>
            </div>

            {/* Section 5 - Your responsibilities */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                5. Your responsibilities
              </h2>
              <div className="space-y-4">
                <p>
                  The subscription depends on your input. You agree to provide the access, context, and decisions a task needs, and to respond to blocking questions in reasonable time. Work that is blocked waiting on you still occupies its active-task slot.
                </p>
                <p>
                  You confirm you have the right to grant us access to every system, repository, and dataset you point us at, and that the work you request does not infringe anyone else&apos;s rights or break the terms of a third-party service.
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <p>
                    <strong className="text-gray-900">Credentials.</strong> Never paste passwords or API keys into a board card, an email, or a recording. Share them through a one-time encrypted link or your own secrets manager.
                  </p>
                  <p>
                    We request least-privilege access, keep a registry of everything you grant us, and revoke all of it when you pause or cancel — confirmed to you in writing.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 - Fees and billing */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                6. Fees and billing
              </h2>
              <div className="space-y-4">
                <p>
                  Subscriptions are billed monthly in advance through Stripe, our payment processor. The first charge occurs at checkout and each renewal on the same day of the following month. All amounts are in US dollars and exclusive of any taxes, which are your responsibility where they apply.
                </p>
                <p>
                  We do not receive or store your card details; Stripe does. You can view invoices, update your payment method, and manage your subscription at any time from the billing portal linked in your welcome email.
                </p>
                <p>
                  If a renewal payment fails, we may pause delivery until it clears. We will tell you before we do.
                </p>
                <p>
                  We may change plan prices with at least 30 days&apos; notice by email. A price change never applies to a billing period you have already paid for.
                </p>
              </div>
            </div>

            {/* Section 7 - Guarantee */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                7. Guarantee
              </h2>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <p>
                  {guarantee.description}
                </p>
                <p>
                  The guarantee applies once per client, to a <strong className="text-gray-900">new</strong> subscription only, and must be claimed within {guarantee.days} days of that subscription&apos;s first charge by emailing us. We refund {guarantee.refundPct}% of that first charge. Work already delivered inside the window remains yours under Section 8.
                </p>
              </div>
            </div>

            {/* Section 8 - Ownership */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                8. Ownership
              </h2>
              <div className="space-y-4">
                <p>
                  <strong className="text-gray-900">You own the work.</strong> On delivery, all right, title, and interest in the code, configuration, and documentation we produce for you transfers to you. Repositories live in your organization, infrastructure in your cloud accounts, and credentials in your vault.
                </p>
                <p>
                  You keep everything you gave us — your data, your content, your trademarks. We claim no rights in them beyond what we need to do the work you asked for.
                </p>
                <p>
                  We keep ownership of our own pre-existing tools, internal libraries, and general know-how. Where any of it is embedded in something we deliver, you get a perpetual, worldwide, royalty-free licence to use, modify, and distribute it as part of that deliverable.
                </p>
                <p>
                  Unless you tell us otherwise in writing, we may describe the <em>kind</em> of work we did for you in general terms. We will not name you, publish your code, or disclose your data as a reference without your written consent.
                </p>
              </div>
            </div>

            {/* Section 9 - Confidentiality */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                9. Confidentiality
              </h2>
              <div className="space-y-4">
                <p>
                  Each of us will keep the other&apos;s non-public information confidential, use it only to perform or receive the Service, and protect it with at least the care we use for our own confidential information. This obligation survives the end of the subscription for three years, and indefinitely for anything that qualifies as a trade secret.
                </p>
                <p>
                  It does not cover information that is already public, that we held before you disclosed it, that we receive from a third party without a duty of confidence, or that we must disclose by law — in which case we will tell you first where we are legally allowed to.
                </p>
              </div>
            </div>

            {/* Section 10 - Third-party services */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                10. Third-party services
              </h2>
              <div className="space-y-4">
                <p>
                  Delivering the Service involves third-party providers — payments, the project board, email, hosting, and AI tooling. The{" "}
                  <Link href="/privacy" className="text-brand hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  lists the ones that process personal data.
                </p>
                <p>
                  We choose them with care but do not control them. We are not responsible for a third-party provider&apos;s outage, change of terms, or discontinuation, nor for services you engage directly.
                </p>
              </div>
            </div>

            {/* Section 11 - Pausing and cancellation */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                11. Pausing and cancellation
              </h2>
              <div className="space-y-4">
                <p>
                  You can pause or cancel at any time from the billing portal — no notice period, no cancellation fee, no conversation required.
                </p>
                <p>
                  <strong className="text-gray-900">Cancelling</strong> stops the next renewal. You keep access for the rest of the period you have paid for. Partial months are not refunded, except under the guarantee in Section 7.
                </p>
                <p>
                  <strong className="text-gray-900">Pausing</strong> suspends billing and delivery. Your board, your delivered work, and your history stay where they are while you are away, and resume when you do.
                </p>
                <p>
                  When you pause or cancel, we revoke every access you granted us and confirm it in writing. We may retain records we need for legal, tax, or accounting purposes.
                </p>
                <p>
                  We may terminate a subscription for material breach of these Terms — non-payment, unlawful use, or abuse of our team — with notice and a chance to fix it where a fix is possible. If we terminate without cause, we refund the unused portion of the current period.
                </p>
              </div>
            </div>

            {/* Section 12 - Warranties and liability */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                12. Warranties, disclaimers, and liability
              </h2>
              <div className="space-y-4">
                <p>
                  We warrant that we will perform the Service with the skill and care reasonably expected of a professional engineering provider. Fixes to things we built are ordinary requests under your subscription — add a card and we address them like any other task.
                </p>
                <p>
                  Beyond that warranty, the Service is provided &quot;as is&quot;. To the fullest extent permitted by law, we disclaim all other warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, and any warranty that the Service or its output will be uninterrupted or error-free.
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <p>
                    <strong className="text-gray-900">Limitation of liability.</strong> To the fullest extent permitted by law, neither party is liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost revenue, or lost or corrupted data, even if advised of the possibility.
                  </p>
                  <p>
                    Each party&apos;s total aggregate liability arising out of or relating to these Terms is limited to the fees you paid in the three months preceding the event giving rise to the claim.
                  </p>
                  <p>
                    Nothing here limits liability that cannot be limited by law, including for fraud, willful misconduct, or death or personal injury caused by negligence.
                  </p>
                </div>
                <p>
                  You are responsible for maintaining backups and for reviewing and testing delivered work before it reaches production or handles real user data.
                </p>
              </div>
            </div>

            {/* Section 13 - Changes to these Terms */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                13. Changes to these Terms
              </h2>
              <div className="space-y-4">
                <p>
                  We may update these Terms from time to time. We will post the new version on this page and update the effective date at the top.
                </p>
                <p>
                  For changes that materially affect your rights, we will notify active clients by email before they take effect. Continuing your subscription after that date means you accept the updated Terms; if you do not, you can cancel under Section 11.
                </p>
              </div>
            </div>

            {/* Section 14 - General */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                14. General
              </h2>
              <div className="space-y-4">
                <p>
                  <strong className="text-gray-900">Independent contractor.</strong> We are an independent contractor. Nothing in these Terms creates an employment, partnership, agency, or joint-venture relationship.
                </p>
                <p>
                  <strong className="text-gray-900">Assignment.</strong> Neither party may assign these Terms without the other&apos;s written consent, except to a successor in a merger or sale of substantially all assets.
                </p>
                <p>
                  <strong className="text-gray-900">Severability and waiver.</strong> If any provision is held unenforceable, the rest stays in force. A failure to enforce a provision is not a waiver of it.
                </p>
                <p>
                  <strong className="text-gray-900">Force majeure.</strong> Neither party is liable for a delay or failure caused by events beyond its reasonable control.
                </p>
                <p>
                  <strong className="text-gray-900">Governing law.</strong> These Terms are governed by the laws of {GOVERNING_LAW}, without regard to its conflict-of-laws rules, and the courts located there have exclusive jurisdiction over any dispute.
                </p>
              </div>
            </div>

            {/* Section 15 - Contact Us */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
                15. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-2xl p-6">
                <p>
                  By email:{" "}
                  <TrackedLink
                    href={`mailto:${CONTACT_EMAIL}`}
                    event="email_click"
                    eventParams={{ location: "terms_page" }}
                    className="text-brand hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </TrackedLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
