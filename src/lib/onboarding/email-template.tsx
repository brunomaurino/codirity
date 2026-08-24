import { Body, Button, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";

export interface WelcomeEmailProps {
  clientName: string | null;
  boardUrl: string;
  accessFormUrl: string;
  planName: string;
  billingPortalUrl: string;
}

/** Shared with email.ts so the subject and this component's preheader can never drift. */
export const WELCOME_EMAIL_SUBJECT = "Welcome to Codirity — your board is ready";

/**
 * Appendix A of docs/HANDOFF-client-onboarding.md, seeded VERBATIM — do not paraphrase
 * client-facing copy (§1.8). The only non-verbatim addition is the footer's billing-
 * portal link, which the P.S. references but Appendix A doesn't spell out the exact
 * wording for.
 *
 * Every SENTENCE is still Appendix A word for word. What moved is where the three URLs
 * sit: Appendix A inlines them mid-sentence, which on a phone renders as a wrapped
 * 60-character Trello URL and buries the one action the step is asking for. Each is now
 * the control right under its own sentence — no words added, removed or reordered.
 *
 * Styled to the redesign-v4 system (docs/HANDOFF-redesign-v4.md §1), which the site
 * shipped and this template had not been swept into: ground band + paper card, hierarchy
 * from SIZE and never weight (nothing above 500), mint reserved for live/interactive.
 * Constraints email adds on top of the web system:
 *   - Apfel Grotezk cannot be webfont-loaded in Gmail/Outlook, so the stack is native.
 *   - No CSS custom properties (Outlook drops them) — the v4 tokens are inlined as hex.
 *   - `color-scheme: light only` stops Gmail/Outlook auto-inverting the palette into
 *     mud; the design is already dark-grounded and must not be flipped again.
 *   - Pill radius degrades to a rectangle in Outlook desktop's Word engine. Accepted:
 *     the button stays legible and clickable, it just loses its corners.
 */
export function WelcomeEmail({ clientName, boardUrl, accessFormUrl, planName, billingPortalUrl }: WelcomeEmailProps) {
  // `?.trim() || "there"` (not `??`) so an empty/whitespace-only name — which Stripe's
  // customer_details.name can in principle carry — falls back the same as a missing one,
  // instead of rendering "Hi ,".
  const greetingName = clientName?.trim() || "there";
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
      </Head>
      <Preview>{WELCOME_EMAIL_SUBJECT}</Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={brandBand}>
            <Text style={wordmark}>
              Codirity<span style={dot}>&nbsp;&bull;</span>
            </Text>
          </Section>

          <Section style={card}>
            <Text style={lede}>Hi {greetingName},</Text>
            <Text style={paragraph}>
              Welcome aboard! Here&apos;s everything you need to get rolling — no meetings required.
            </Text>

            <Text style={stepLabel}>
              <span style={stepNum}>1</span> Your request board
            </Text>
            <Text style={paragraph}>We&apos;ve set up your private board:</Text>
            <Button href={boardUrl} style={primaryButton}>
              Open your board
            </Button>
            <Text style={paragraph}>
              Accept the invite and you&apos;re live. Everything about how to work with us lives on the
              board itself — start with the &quot;👋 Start here&quot; card.
            </Text>

            <Text style={stepLabel}>
              <span style={stepNum}>2</span> Add your first request today
            </Text>
            <Text style={paragraph}>
              Seriously — do it now, even if it&apos;s rough. Write it, link a doc, or record a quick
              Loom. We&apos;ll pick the fastest win in your queue and aim to deliver within 2–3 business
              days.
            </Text>

            <Text style={stepLabel}>
              <span style={stepNum}>3</span> Grant us access (5 minutes)
            </Text>
            <Text style={paragraph}>
              To ship automations and code we&apos;ll need access to your tools:
            </Text>
            <Button href={accessFormUrl} style={secondaryButton}>
              Open the access form
            </Button>
            <Text style={paragraph}>
              Important: never paste passwords or API keys into Trello or email — the form explains how
              to share them securely.
            </Text>

            <Section style={rule} />

            <Text style={paragraph}>
              That&apos;s it. All communication happens in card comments, and I personally reply to
              everything.
            </Text>

            <Text style={signature}>
              Bruno
              <br />
              <span style={signatureRole}>Founder, Codirity</span>
            </Text>

            <Text style={postscript}>
              P.S. You&apos;re on the {planName} plan — pause or cancel anytime from the billing portal
              link in this email&apos;s footer.
            </Text>
          </Section>

          <Section style={footerBand}>
            <Text style={footerText}>
              Manage or cancel your subscription anytime:{" "}
              <Link href={billingPortalUrl} style={footerLink}>
                Billing portal
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

// ─── redesign-v4 tokens, inlined (globals.css cannot travel into an inbox) ───
const GROUND = "#0A1712";
const PAPER = "#EDEDE6";
const CHALK = "#F4F7F2";
const CHALK_DIM = "#A9B8AF";
const INK = "#0A1712";
const INK_DIM = "#4C5B52";
const MINT = "#6EE7A8";
const RULE_INK = "rgba(10, 23, 18, 0.16)";
const STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const main = { backgroundColor: GROUND, fontFamily: STACK, margin: "0", padding: "0" };

const outer = { margin: "0 auto", padding: "32px 16px 40px", maxWidth: "600px" };

const brandBand = { padding: "8px 8px 24px" };

// 500 is the ceiling everywhere: v4 takes hierarchy from size, never weight.
const wordmark = {
  color: CHALK,
  fontSize: "22px",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  lineHeight: "28px",
  margin: "0",
};

// The header dot is the one mint element — it stands for the live queue, same as the
// pulsing dot in the site header.
const dot = { color: MINT };

const card = {
  backgroundColor: PAPER,
  borderRadius: "18px",
  padding: "40px 36px 36px",
};

const lede = { color: INK, fontSize: "17px", lineHeight: "26px", margin: "0 0 18px" };

const paragraph = { color: INK, fontSize: "15px", lineHeight: "25px", margin: "0 0 18px" };

// 19px against the body's 15px IS the hierarchy — the v3 template used 15px bold, which
// v4 forbids and which left the steps indistinguishable once the weight was dropped.
const stepLabel = {
  color: INK,
  fontSize: "19px",
  fontWeight: 500,
  letterSpacing: "-0.01em",
  lineHeight: "28px",
  margin: "32px 0 10px",
};

const stepNum = { color: INK_DIM, fontVariantNumeric: "tabular-nums" };

const primaryButton = {
  backgroundColor: GROUND,
  borderRadius: "999px",
  color: CHALK,
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 500,
  lineHeight: "20px",
  margin: "0 0 20px",
  padding: "14px 28px",
  textDecoration: "none",
};

const secondaryButton = {
  backgroundColor: "transparent",
  border: `1px solid ${INK_DIM}`,
  borderRadius: "999px",
  color: INK,
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 500,
  lineHeight: "20px",
  margin: "0 0 20px",
  padding: "13px 27px",
  textDecoration: "none",
};

const rule = { borderTop: `1px solid ${RULE_INK}`, margin: "34px 0 26px" };

const signature = { color: INK, fontSize: "15px", lineHeight: "25px", margin: "0 0 18px" };

const signatureRole = { color: INK_DIM };

const postscript = { color: INK_DIM, fontSize: "14px", lineHeight: "23px", margin: "0" };

const footerBand = { padding: "24px 8px 0" };

const footerText = { color: CHALK_DIM, fontSize: "13px", lineHeight: "20px", margin: "0" };

const footerLink = { color: CHALK_DIM, textDecoration: "underline" };
