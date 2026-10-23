import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { CONTACT_EMAIL, AUDIT_TURNAROUND, audit } from "@/config/offer";

interface AuditRequestData {
  name: string;
  email: string;
  website: string;
  stage: string;
  message?: string;
  /** Honeypot. Hidden from people, filled in by form-spamming bots. */
  hp_note?: string;
  /** Where the visitor came from, read off the landing URL by the form. */
  attribution?: Record<string, unknown>;
}

// Same single inbox as /api/contact, for the same reason: a rejected RCPT TO can
// fail the whole send, so only an address proven to accept mail goes here.
const RECIPIENTS = [CONTACT_EMAIL];

// Paid traffic brings bots, and every field below ends up in an email. Caps keep
// one request from turning into a megabyte of HTML in the founder's inbox.
const MAX_FIELD = 200;
const MAX_MESSAGE = 2000;

const STAGES = new Set(audit.stages.map((s) => s.value));

// The only attribution keys copied into the email. Anything else the client
// sends is dropped, so the payload cannot grow new fields from the outside.
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;

/** Accepts "acme.com", "www.acme.com/pricing" or a full URL; returns the
 *  normalized https URL, or null when there is no real hostname in it. */
function normalizeWebsite(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    // URL() already rejects spaces; requiring a dot rules out "localhost" and
    // bare words without pretending to validate public suffixes.
    if (!url.hostname.includes(".")) return null;
    return `https://${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: AuditRequestData;
    try {
      body = await request.json();
    } catch {
      body = null as unknown as AuditRequestData;
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Honeypot tripped: answer exactly like a success so the bot learns nothing,
    // and send nothing.
    if (body.hp_note) {
      // Logged so a silent drop rate stays observable: if a real browser's
      // autofill ever starts filling this, it shows up here, not as lost leads.
      console.warn("Audit request dropped by honeypot");
      return NextResponse.json({ success: true });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const stage = typeof body.stage === "string" ? body.stage : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const website =
      typeof body.website === "string" ? normalizeWebsite(body.website) : null;

    if (!name || !email || !body.website || !stage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (name.length > MAX_FIELD || email.length > MAX_FIELD || message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { error: "One of the fields is too long" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!website || website.length > MAX_FIELD) {
      return NextResponse.json(
        { error: "Please enter your site's address, like acme.com" },
        { status: 400 }
      );
    }

    if (!STAGES.has(stage)) {
      return NextResponse.json(
        { error: "Please pick your company's stage" },
        { status: 400 }
      );
    }

    const stageLabel = audit.stages.find((s) => s.value === stage)?.label ?? stage;

    const attribution: [string, string][] = [];
    if (body.attribution && typeof body.attribution === "object") {
      for (const key of ATTRIBUTION_KEYS) {
        const value = body.attribution[key];
        if (typeof value === "string" && value) {
          attribution.push([key, value.slice(0, MAX_FIELD)]);
        }
      }
    }

    const sanitize = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const row = (label: string, value: string) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">${label}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${value}</td>
          </tr>`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #163F31; border-bottom: 2px solid #1E5C46; padding-bottom: 10px;">
          New Free Audit Request
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${row("Website", sanitize(website))}
          ${row("Name", sanitize(name))}
          ${row("Email", `<a href="mailto:${sanitize(email)}" style="color: #1E5C46;">${sanitize(email)}</a>`)}
          ${row("Stage", sanitize(stageLabel))}
          ${attribution.map(([k, v]) => row(k, sanitize(v))).join("")}
        </table>

        ${
          message
            ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #163F31; margin-bottom: 10px;">What worries them</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${sanitize(message)}</div>
        </div>
        `
            : ""
        }

        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Sent from codirity.com/audit. The page promises the report within ${AUDIT_TURNAROUND}.
        </p>
      </div>
    `;

    const textContent = [
      "New free audit request",
      "",
      `Website: ${website}`,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Stage:   ${stageLabel}`,
      ...attribution.map(([k, v]) => `${k}: ${v}`),
      ...(message ? ["", "What worries them:", message] : []),
      "",
      `Sent from codirity.com/audit. The page promises the report within ${AUDIT_TURNAROUND}.`,
    ].join("\n");

    await sendMail({
      to: RECIPIENTS,
      replyTo: email,
      subject: `Audit request: ${website.replace(/^https:\/\//, "")}`,
      text: textContent,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Audit request error:", error);
    return NextResponse.json(
      { error: "Failed to send your request. Please try again later." },
      { status: 500 }
    );
  }
}
