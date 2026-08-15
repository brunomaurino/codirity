import { Body, Container, Head, Hr, Html, Link, Preview, Text } from "@react-email/components";

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
 */
export function WelcomeEmail({ clientName, boardUrl, accessFormUrl, planName, billingPortalUrl }: WelcomeEmailProps) {
  // `?.trim() || "there"` (not `??`) so an empty/whitespace-only name — which Stripe's
  // customer_details.name can in principle carry — falls back the same as a missing one,
  // instead of rendering "Hi ,".
  const greetingName = clientName?.trim() || "there";
  return (
    <Html>
      <Head />
      <Preview>{WELCOME_EMAIL_SUBJECT}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={paragraph}>Hi {greetingName},</Text>
          <Text style={paragraph}>
            Welcome aboard! Here&apos;s everything you need to get rolling — no meetings required.
          </Text>

          <Text style={heading}>1. Your request board</Text>
          <Text style={paragraph}>
            We&apos;ve set up your private board: <Link href={boardUrl}>{boardUrl}</Link>
            <br />
            Accept the invite and you&apos;re live. Everything about how to work with us lives on the
            board itself — start with the &quot;👋 Start here&quot; card.
          </Text>

          <Text style={heading}>2. Add your first request today</Text>
          <Text style={paragraph}>
            Seriously — do it now, even if it&apos;s rough. Write it, link a doc, or record a quick
            Loom. We&apos;ll pick the fastest win in your queue and aim to deliver within 2–3 business
            days.
          </Text>

          <Text style={heading}>3. Grant us access (5 minutes)</Text>
          <Text style={paragraph}>
            To ship automations and code we&apos;ll need access to your tools:{" "}
            <Link href={accessFormUrl}>{accessFormUrl}</Link>
            <br />
            Important: never paste passwords or API keys into Trello or email — the form explains how
            to share them securely.
          </Text>

          <Text style={paragraph}>
            That&apos;s it. All communication happens in card comments, and I personally reply to
            everything.
          </Text>

          <Text style={paragraph}>
            Bruno
            <br />
            Founder, Codirity
          </Text>

          <Text style={paragraph}>
            P.S. You&apos;re on the {planName} plan — pause or cancel anytime from the billing portal
            link in this email&apos;s footer.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Manage or cancel your subscription anytime: <Link href={billingPortalUrl}>{billingPortalUrl}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

const main = {
  backgroundColor: "#FAF7F1",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "560px",
};

const paragraph = {
  color: "#163F31",
  fontSize: "15px",
  lineHeight: "24px",
};

const heading = {
  color: "#163F31",
  fontSize: "15px",
  fontWeight: 700,
  lineHeight: "24px",
  marginBottom: "0",
};

const hr = {
  borderColor: "#DCE5DC",
  margin: "24px 0",
};

const footer = {
  color: "#4E8D74",
  fontSize: "13px",
  lineHeight: "20px",
};
