# Environment variables

> **This file is the `.env.example` the rebuild brief asked for.** Writing a literal `.env.example`
> is blocked by a permission rule in this workspace (a deny rule covering `.env*`), so the template
> lives here instead. Copy the block below into `.env.example` yourself if you want the
> conventional filename — the content is identical and contains no values.

This repository is **PUBLIC**. Nothing here is a value, and nothing here may become one. Set real
values in the Vercel project (Settings → Environment Variables) and nowhere else.

None of the Stripe variables may ever be renamed with a `PUBLIC_` prefix. Astro inlines `PUBLIC_`
variables into the browser bundle, so a `PUBLIC_STRIPE_SECRET_KEY` would publish the key to every
visitor.

```dotenv
# --- Contact form (already live in production) ---
SENDGRID_API_KEY=<set-in-vercel>
CONTACT_TO_EMAIL=<set-in-vercel>
CONTACT_FROM_EMAIL=<set-in-vercel>

# --- Stripe: server-side only ---

# Test-mode secret key (starts sk_test_). Moving to a live key is an owner action, not a code change.
STRIPE_SECRET_KEY=<set-in-vercel>

# Signing secret for /api/stripe-webhook (starts whsec_), from the Dashboard webhook endpoint.
STRIPE_WEBHOOK_SECRET=<set-in-vercel>

# Canonical origin used to build Checkout return URLs. Never taken from the request.
PUBLIC_SITE_URL=https://www.thebytelite.com

# --- Commerce gating ---

# disabled | test | reservation | live
#   disabled    - no payment or payment-method control active anywhere (DEFAULT: anything
#                 unrecognised, including unset, resolves to this)
#   test        - Stripe test-mode flows active for verification
#   reservation - no-charge founder reservations only
#   live        - live paid commerce; requires separate owner approval
COMMERCE_PHASE=disabled

# prelaunch | closed. Closes on general release of a product, never on a countdown date.
FOUNDER_OFFER_PHASE=closed

# Stripe's hosted customer-portal LOGIN link (the no-code one, where the customer enters their own
# email and Stripe sends them a link). A public URL, not a secret.
STRIPE_CUSTOMER_PORTAL_URL=

# --- Stripe Price IDs ---
# A plan whose Price ID is absent renders as "being configured" and its checkout call is refused
# server-side. That is the intended state until each price is approved.
STRIPE_PRICE_BYTELITE_MONTHLY_FOUNDER=
STRIPE_PRICE_BYTELITE_ANNUAL_FOUNDER=
STRIPE_PRICE_CORDEL_CONNECT_MONTHLY_FOUNDER=
STRIPE_PRICE_CORDEL_CONNECT_ANNUAL_FOUNDER=

# Create with a customer-chosen (custom_unit_amount) price in the Dashboard. One-time, never recurring.
STRIPE_PRICE_FOUNDER_SUPPORTER_PACK=

# true | false. Leave false until tax registrations, product tax codes and filing responsibility
# are settled. Stripe supporting automatic tax is not the same as being registered to collect it.
STRIPE_AUTOMATIC_TAX_ENABLED=false
```

## Notes that are not obvious from the names

**Cordel Play deliberately has no Price ID.** Its founder reservation takes no payment. The FTC
Mail, Internet, or Telephone Order Merchandise Rule requires a shipment window and a
delay-consent/refund process before money changes hands, and neither is approved yet.

**No founder price is computed in this repository.** The benefit is "10% lower price", but 10% off
$9.99 is $8.991 and Stripe prices are integer minor units. Rounding that is a commercial decision
with a legal consequence, so the rounded figure lives in an owner-approved Stripe Price object and
reaches the code only as an ID. Nothing here multiplies a price by 0.9.

**There is no billing-portal endpoint, on purpose.** `/billing` links to
`STRIPE_CUSTOMER_PORTAL_URL`. An endpoint that mints a portal session from a checkout session id
would hand anyone holding that id someone else's billing account.
