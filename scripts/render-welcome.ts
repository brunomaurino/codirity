import { writeFileSync } from "node:fs";
import { render } from "@react-email/render";
import { WelcomeEmail } from "../src/lib/onboarding/email-template";

async function main() {
  const html = await render(WelcomeEmail({
    clientName: "Bruno Maurino",
    boardUrl: "https://trello.com/b/aB3xY9Qz/bruno-maurino-codirity",
    accessFormUrl: "https://tally.so/r/EkVev4",
    planName: "Standard",
    billingPortalUrl: "https://billing.stripe.com/p/login/00w4gAbfe86a2XHcBrcwg00",
  }));
  writeFileSync(process.argv[2], html);
  console.log(`${process.argv[2]} — ${html.length} bytes`);
}
main();
