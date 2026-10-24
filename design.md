# design.md — DASTAAN UI Design (Theme 2: Royal Burgundy, Gold & Cream)

Rule: update existing app, naya app nahi. Saari functionality, navigation, contexts, data preserve. Theme sirf look badalti ha.

## 1. Design style
- Premium, classic, fine-dining look. Minimal, balanced layouts.
- Cards radius 12-18 (default 16), subtle shadow, consistent spacing.
- Gold sparingly. Poori app gold ya poori burgundy nahi.
- Headings: refined serif (jahan supported), body: clean sans-serif.
- Koi neon, heavy gradient, extra animation ya clutter nahi.
- Har data screen par loading / error+Retry / empty state.

## 2. Official palette (light)

| Token | Hex | Use |
|---|---|---|
| primary (Burgundy) | #4B1420 | buttons, headers, active tabs, important icons |
| gold | #D4AF37 | ratings, thin lines, selected indicators, small highlights |
| background (Cream) | #F8F1E5 | screen background |
| surface (White) | #FFFFFF | cards, inputs, modals |
| text (Espresso) | #2B2118 | headings, body, prices |
| border | #E5D9C8 | separators, input outline, card border |
| textMuted | #766B63 | secondary text, inactive icons, upcoming steps |
| tint | #F3E5E8 | light burgundy highlight, selected row bg |
| onPrimary | #FFFFFF | text on burgundy |
| onGold | #2B2118 | text on gold (gold par kabhi white nahi) |
| success | #2E7D4F | Ready, success message |
| danger | #B3261E | errors, Cancelled |

## 3. Dark palette (A1 Q6 ke liye zaroori, doc mein nahi tha)

| Token | Hex |
|---|---|
| primary | #8A2A3F (dark par halka burgundy, warna nazar nahi aata) |
| gold | #D4AF37 |
| background | #1A1114 |
| surface | #2A1B20 |
| text | #F8F1E5 |
| border | #4A3A3F |
| textMuted | #B7A9A0 |
| tint | #3A222A |
| onPrimary | #FFFFFF |
| onGold | #2B2118 |
| success | #5CC38A |
| danger | #EF6B63 |

Dono palettes ek hi file mein: `src/theme/colors.js`. Screens `useTheme()` se colours lein, raw hex nahi. Radius aur spacing bhi usi file mein.

## 4. Typography and spacing
- Screen title 24 serif bold, section 18 semibold, body 15, caption 12 muted
- Spacing scale 4, 8, 12, 16, 24
- Radius: card 16, button 12, chip 20
- Shadow light mein halka; dark mein border use karo
- Touch target min 44px

## 5. Components

| Component | Detail |
|---|---|
| PrimaryButton | bg burgundy, text white, radius 12, fixed height; loading spinner, disabled (opacity), pressed state |
| SecondaryButton | bg gold, text espresso; sirf secondary actions |
| OutlinedButton | transparent/white, border + text burgundy |
| FormInput | white bg, espresso text, border #E5D9C8, label upar, error text neeche (danger + icon/text) |
| MenuItemCard (React.memo) | consistent image size, name, price, description, rating (gold) agar data mein ho, heart, Add button; unavailable = greyed + disabled |
| CategoryChips | selected = burgundy fill + gold underline/dot, unselected = white + border |
| QuantityStepper | clear + / - buttons |
| StatusStepper | current/done = burgundy, selected marker gold, upcoming = muted |
| Loader / ErrorView / EmptyState | friendly message + Retry |
| FloatingBackToTop | burgundy circle, 300px scroll ke baad |

## 6. Screens

**Splash / Welcome (optional extra)** — burgundy background, logo + restaurant name "DASTAAN" (serif, cream), thin gold line, "Get Started" button. Agar app mein pehle se splash ha to sirf restyle.

**Login / Signup** — "DASTAAN" naam upar (serif), cream bg, white form card, burgundy button, bordered inputs, show/hide password, validation messages, loading state, gold sirf chhota accent. Auth logic same.

**Home (optional extra, agar app mein ha)** — burgundy header with greeting + "DASTAAN" branding, white search bar, promo banner existing food image se, category chips, Popular / Recommended cards. Add-to-cart aur favourite functional. Koi offer, rating ya price invent nahi karna, existing data hi.

**Menu** — cream bg, white cards, burgundy headings, gold selected accent, price clearly visible, search + category + sort kaam karein, Add button asani se nazar aye, header "Menu (N)", pull to refresh, back-to-top, render counter label (A1 Q5 requirement).

**Cart** — white item cards (image, name, price, quantity), stepper, per-item note, promo input, subtotal + total (total burgundy), "Proceed to Checkout" burgundy button, empty cart state, tab badge.

**Order Summary / Checkout** — white cards on cream, sections: delivery/dine-in details, order items, payment summary (Subtotal, Service 5%, Tax 15%, Discount, Grand total). Dine-in table ya Takeaway pickup time. Main action burgundy.

**Reservation** — cream bg, page heading, white form cards: date, hourly slot grid 12:00-22:00, party size 1-12, table, phone. Selected date/slot = gold highlight, disabled slot = muted. Confirmation modal, My Reservations + cancel.

**Order Tracking** — timeline/stepper Pending > Preparing > Ready > Served, current/done burgundy, gold marker, upcoming muted, status text + timestamp, elapsed time, 10s polling.

**Profile** — cream bg, white cards, burgundy headings/icons, name/email/role, dark mode switch, order history, logout.

**Manager Dashboard (admin panel)** — same theme. Top stats in white cards (heading + value), 3 tabs: Incoming Orders (status buttons), Reservations (accept/decline), Menu Management (add item, edit price, availability switch). Burgundy actions, subtle gold highlights. Customers ko manager features nazar nahi aane chahiye.

## 7. Bottom navigation
- White/cream bar, selected icon + label burgundy, small gold indicator, inactive muted
- Customer: Menu, Cart(badge), Reserve, Orders, Profile
- Manager: Dashboard, Menu, Profile
- Koi duplicate tab nahi, koi existing route remove nahi

## 8. Status styling (colour + text/icon dono)
Pending = gold + "Pending", Preparing = burgundy, Ready = success, Served = muted, Cancelled = danger. Hamesha text label ya icon bhi ho, sirf colour par depend nahi.

## 9. Accessibility
- Contrast achha, gold par espresso text
- Errors sirf colour se nahi, text/icon bhi
- Chhoti screens par text clip ya overlap nahi
- Buttons par accessibilityLabel

## 10. Theme final testing
1. Customer aur manager screens ek hi palette
2. Login/Register, search/filter, cart, checkout, reservation, tracking, profile/logout sab pehle jaise
3. Light aur dark dono mein har screen check
4. Koi feature remove nahi, koi naya TypeScript/import error nahi
