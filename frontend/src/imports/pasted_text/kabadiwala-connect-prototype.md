You are a senior product designer and frontend engineer. Design and build a polished, high-fidelity hackathon frontend prototype for a platform named **Kabadiwala Connect**.

Do not give me a tutorial, a generic plan, pseudocode, or a partial mock-up. Make strong design decisions and provide a complete, working frontend.

## Product context

Kabadiwala Connect is a trusted digital marketplace that connects companies with verified Kabadiwalas.

It is a **single unified portal with two role-based views**:

1. **Company**
   - Posts a waste/material request with company contact details, location, image, waste type, and approximate quantity.
   - Sees eligible Kabadiwalas ranked by:
     - Waste-type compatibility
     - Distance
     - Availability
     - Rating
   - Chooses a Kabadiwala.
   - Reviews the Kabadiwala’s offer.
   - Pays digitally through Kabadiwala Connect.
   - Tracks completion.

2. **Kabadiwala**
   - Has completed platform authentication and provided verified bank details.
   - Receives and reviews assigned requests.
   - Uses AI-assisted image analysis to assess the material.
   - AI suggests material type, estimated weight, and a fair price range.
   - Sends an offer to the company.
   - After payment, sells/drops the material.
   - Receives a payout after the platform deducts a commission.

Important: the Kabadiwala does **not** pick up material. Do not use “pickup,” “collection route,” recycler marketplace, route optimization, delivery fleet, or a recycler role anywhere in the interface. Use the status wording **“Sold/Dropped”** for completion.

AI analysis is operated by the Kabadiwala. The Company only sees the final offer and a short assessment summary after it is submitted.

## Demo scenario and content

Use realistic, India-focused mock data.

Main company:
- ABC Office Solutions
- Contact person: Riya Sharma
- Location: Malviya Nagar, Jaipur
- Request: PET Plastic
- Approximate quantity: 20 kg

Top Kabadiwala:
- GreenCycle Kabadiwala
- Verified
- Rating: 4.8
- Distance: 1.2 km
- Availability: Available today
- Materials accepted: PET Plastic, Cardboard, Aluminium
- Match score: 94%
- Offer: ₹320
- Short explanation: “Closest verified PET specialist available today.”

Create four additional Kabadiwala profiles that have believable differences in distance, rating, availability, accepted materials, and match scores.

Payment data:
- Agreed material value: ₹320
- Platform commission: 5%
- Platform commission amount: ₹16
- Kabadiwala payout: ₹304
- Payment method: UPI / card / bank transfer mock options
- Use a visible secure-payment message and a digital receipt state.

## UX and screens

This must feel like one coherent portal, not separate applications.

### Shared portal shell

Create:
- A premium left sidebar on desktop.
- A compact top bar with search, notifications, profile/avatar, and a Company/Kabadiwala role switcher.
- Smooth view transitions.
- Responsive mobile layout with a collapsible sidebar.
- Toast notifications for actions such as selection, offer sent, payment completed, and status updated.
- Persistent mock state during the session so actions are reflected when switching roles.

Sidebar items:
- Dashboard
- Requests
- Matches / Offers
- Payments
- Profile

Use different labels where appropriate for each role.

### Company flow

#### 1. Company Dashboard
Include:
- Greeting for Riya Sharma.
- Summary cards: Active Requests, Offers Received, Total Paid, Completed Deals.
- A “Create New Request” primary action.
- Recent request card for “20 kg PET Plastic.”
- A small progress/timeline component showing the request status.
- A “Recommended Kabadiwala” card for GreenCycle.

#### 2. Post Material Request
Make it a clean multi-section form:
- Company name
- Contact person
- Phone number
- Email
- Location
- Waste/material type dropdown
- Approximate quantity
- Description
- Image upload placeholder with a good visual state
- Submit button: “Find Eligible Kabadiwalas”

On submit, show a polished processing state, then navigate to ranked matches.

#### 3. Ranked Kabadiwalas
Show:
- Heading: “Best Kabadiwalas for your request”
- Short explanation of the ranking system.
- Match-score legend:
  - Waste-type compatibility: 35%
  - Distance: 25%
  - Availability: 20%
  - Rating: 20%
- Optional filter chips for Available Today, Verified Only, Within 5 km, 4.5+ Rating.
- Five Kabadiwala cards sorted by match score.
- Each card should include:
  - Initial/avatar
  - Name
  - Verified badge
  - Star rating
  - Distance
  - Availability
  - Material tags
  - Match score with progress indicator
  - Estimated offer
  - A concise “Why this match?” sentence
  - View profile and Select buttons
- Make GreenCycle visually recommended but not exaggerated.

#### 4. Kabadiwala Profile / Selection
Show:
- Detailed profile card.
- Verified identity / verified bank status.
- Rating and completed-deal statistics.
- Materials accepted.
- Match explanation.
- Recent review snippets.
- “Choose GreenCycle Kabadiwala” button.

#### 5. Offer and Secure Payment
After selection, show:
- Selected Kabadiwala.
- Offer amount ₹320.
- Short assessment summary:
  - AI-assisted assessment completed
  - PET Plastic
  - Estimated 18–22 kg
  - Fair price range ₹300–₹340
- Payment breakdown:
  - Material value ₹320
  - Platform commission ₹16
  - Kabadiwala payout ₹304
- Payment method selector.
- “Pay ₹320 Securely” button.
- On clicking payment, show a successful digital receipt with transaction reference, timestamp, payout status, and “Track Request” button.

#### 6. Request Tracking
Show a modern horizontal/vertical timeline:
- Request Submitted
- Kabadiwala Selected
- Offer Accepted
- Payment Completed
- Material Sold/Dropped

Use clear status colors and a small note about the platform’s secure transaction record.

### Kabadiwala flow

#### 1. Kabadiwala Dashboard
When role is switched, show GreenCycle Kabadiwala’s dashboard:
- Greeting.
- Summary cards: Assigned Requests, Pending Offers, This Month’s Earnings, Rating.
- Verification status card:
  - Identity verified
  - Bank account verified
  - Secure payments enabled
- Assigned request from ABC Office Solutions.
- Recent earnings / payout activity.

#### 2. Request Detail
Show:
- Company name and contact details.
- Location: Malviya Nagar, Jaipur.
- Waste type: PET Plastic.
- Approximate quantity: 20 kg.
- Material image placeholder.
- Status.
- Button: “Analyze Material with AI.”

#### 3. AI-Assisted Assessment
This is the most visually impressive Kabadiwala screen.

Before analysis:
- Show a scan/upload panel with the material image and an “Analyze Material with AI” button.

After analysis:
- Reveal a professional assessment card with:
  - Detected Material: PET Plastic
  - Confidence: 94%
  - Estimated Weight: 18–22 kg
  - Quality: Good / recyclable
  - Suggested Fair Price Range: ₹300–₹340
- Include an information note that this is an AI-assisted estimate and final pricing remains with the Kabadiwala.
- Have a price input prefilled with ₹320.
- Button: “Send Offer to ABC Office Solutions.”

After sending:
- Update the offer status.
- Create a notification visible on the Company side when the role is switched.

#### 4. Completion and Earnings
Once payment is complete:
- Display payment confirmation.
- Show platform commission.
- Show expected payout ₹304 to verified bank account.
- Button: “Mark Material as Sold/Dropped.”
- On click, update the status timeline and show a success confirmation.
- Display completed transaction in earnings history.

## Visual design requirements

Create a design that feels intentional, restrained, modern, and made by a thoughtful human designer—not like a generic AI dashboard.

Use this palette:
- Canvas / warm off-white: `#F7F5EF`
- Primary forest green: `#21644A`
- Dark text: `#1E2822`
- Soft green surface: `#E4F0E8`
- Deep green: `#164534`
- Gold accent for money, recommendation, and value: `#D79A32`
- Warm neutral border: `#DDD8CD`
- Muted text: `#667169`
- Success green: `#3D8D62`
- Error red only if necessary: `#B84A4A`

Typography:
- Use system fonts or a reliable web-safe stack.
- Strong hierarchy.
- Large but not oversized dashboard headings.
- Compact, readable metadata.
- Good contrast and accessible states.

Layout:
- Desktop-first dashboard at approximately 1440px wide.
- Responsive down to mobile.
- 12-column feeling in the main content area.
- Spacious cards with subtle shadow and soft rounded corners.
- Avoid excessive rounded pills.
- Avoid gradients.
- Avoid loud neon.
- Avoid emoji as interface icons.
- Use tasteful inline SVG icons or simple CSS shapes if icons are necessary.
- Make the interface look plausible for an Indian circular-economy / B2B marketplace startup.

## Technical requirements

Build this as a single self-contained `index.html`.

- Put all CSS inside a `<style>` block.
- Put all JavaScript inside a `<script>` block.
- Do not use React, Tailwind, npm packages, external icon packages, external APIs, or a backend.
- Do not depend on external images. Use elegant upload/image placeholders, initials, CSS, and inline SVG where needed.
- Use vanilla JavaScript.
- Use frontend state to switch roles, submit the form, show rankings, select a Kabadiwala, submit an offer, process mock payment, and mark the request as Sold/Dropped.
- Do not leave dead buttons.
- Make every primary button produce a meaningful visible state change.
- Include comments in the code that make it easy for a beginner to change mock data, colors, and labels.
- Ensure the final file can be saved as `index.html` and opened directly in a browser.

## Output format

First, give a concise design rationale in no more than 150 words.

Then provide the complete final `index.html` inside one code block.

Do not provide placeholders like “add your code here.” Do not omit sections. Do not ask me questions. Make sensible decisions and deliver a complete, polished, functional frontend.