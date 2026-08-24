import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { CONTACT_EMAIL } from "@/config/offer";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

// One inbox, and it is the same address the site publishes (offer.ts CONTACT_EMAIL) —
// so the "write to us" link and the form land in the same place. The three
// @codirity.com addresses that used to be here all sit on the inactive Workspace, so
// every one of them would bounce — and a rejected RCPT TO can fail the whole send.
const RECIPIENTS = [CONTACT_EMAIL];

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    const { firstName, lastName, email, message } = body;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Sanitize inputs for HTML
    const sanitize = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    // Build email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #163F31; border-bottom: 2px solid #1E5C46; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Name</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${sanitize(firstName)} ${sanitize(lastName)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <a href="mailto:${sanitize(email)}" style="color: #1E5C46;">${sanitize(email)}</a>
            </td>
          </tr>
          ${
            body.company
              ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Company</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${sanitize(body.company)}</td>
          </tr>
          `
              : ""
          }
          ${
            body.service
              ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${sanitize(body.service)}</td>
          </tr>
          `
              : ""
          }
        </table>

        <div style="margin-top: 20px;">
          <h3 style="color: #163F31; margin-bottom: 10px;">Message</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${sanitize(message)}</div>
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This message was sent from the Codirity website contact form.
        </p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Codirity Contact" <${process.env.SMTP_USER}>`,
      to: RECIPIENTS.join(", "),
      replyTo: email,
      subject: `New Contact Form: ${firstName} ${lastName}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
