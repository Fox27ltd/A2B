# Client questions — A2B Autocentre

Items to confirm with the client before launch. Each one is marked as `TBD` in `config/brand.config.ts` or copy until confirmed.

## Confirmed (already in brand.config.ts)
- ✅ Year established: **2016**
- ✅ Testimonial sources: **RAC Approved Garage Network + Google Reviews**
- ✅ Google Business Profile: verified, has workshop/team photos

## Still open
1. **Google Place ID** — needed to wire live Google reviews via Places API (Phase 7+). Find at: https://developers.google.com/maps/documentation/places/web-service/place-id
2. **Full Bronze / Silver / Gold service checklists** — current copy is industry-standard placeholders pending the official spec sheet.
3. **MOT base price confirmation** — listed as "from £35"; confirm whether it has moved.
4. **RAC MOT Check & Repair Plan** — confirm £750 cap and any exclusions / claim window.
5. **Photography** — pull workshop/team photos from Google Business Profile, plus any higher-res originals the client has.
6. **Logo** — vector / high-res PNG, drop into `public/brand/`.
7. **Owner name(s) + bio** for About page.
8. **Booking flow** — phone only for now, or do they want an online form / calendar?
9. **Social channels** — any active Facebook / Instagram / TikTok to link in footer?
10. **Domain** — keep `a2bautocentre.com` (DNS transfer) or new domain on launch?
11. **Quote form delivery** — currently opens user's mail app pre-filled to `a2bautocentre@gmail.com`. Easy upgrades when ready: Formspree (5 min, no backend), Resend + Next route handler (10 min, proper inbox API), or Web3Forms. Decide before launch if mailto-only is acceptable.
12. **Geo coordinates** — for the AutoRepair JSON-LD `geo` field. Easiest: open Google Maps, right-click the garage, copy lat/lng (e.g. `51.5167, 0.1933`). Improves local-search ranking.
13. **Production site URL** — set `NEXT_PUBLIC_SITE_URL` in Vercel before launch (currently defaults to a placeholder). Required for canonical URLs, sitemap and OG image to point at the live domain.

## Legal (Phase 7b) — confirm with A2B before launch
14. **Business structure** — sole trader / partnership / Limited company? (Update `lib/legal.ts` `controller.structure`.)
15. **If Ltd:** company number, registered office address, place of registration (England / Wales / Scotland / NI). (Companies Act 2006 requires these to be displayed.)
16. **ICO registration number** — they almost certainly need to register because the quote form collects personal data (£52/year, ~10 minutes online at https://ico.org.uk/registration). Once registered, drop the reference number into `lib/legal.ts` `controller.icoNumber`.
17. **Quote retention preference** — currently set to "6 months from last contact" in the Privacy Policy. Confirm or adjust in `lib/legal.ts` `retention.quoteEnquiries`.
18. **RAC trademark consent** — A2B confirms they are a current paid-up RAC Approved member, so use of the "RAC Approved" mark is licensed. (We display this in the footer disclosure.)
19. **Review consent** — confirm the three RAC reviewers (T.A., N.Y., S.T.) consented to use of their initials and review text on the public site. Required under the Digital Markets, Competition and Consumers Act 2024.
