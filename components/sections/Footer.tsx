// v0.3 — Footer
// Adds legal column, Companies Act-style business disclosure block, and
// privacy / terms / cookies links.
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { brand } from "@/config/brand.config";
import { legal } from "@/lib/legal";

export function Footer() {
  const year = new Date().getFullYear();
  const isLtd = legal.controller.structure === "Limited company";

  return (
    <footer className="border-t border-line bg-ink py-14">
      <div className="container-x grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image
            src={brand.client.logo}
            alt={brand.client.name}
            width={360}
            height={123}
            className="h-20 w-auto md:h-24"
          />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            {brand.client.tagline}
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Family-run, RAC Approved garage. Serving Rainham and east London since {brand.client.yearEstablished}.
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={brand.ctas.secondary.href} className="flex items-center gap-3 text-white hover:text-accent">
                <Phone className="h-4 w-4 text-accent" />
                {brand.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${brand.contact.email}`} className="flex items-center gap-3 text-white hover:text-accent">
                <Mail className="h-4 w-4 text-accent" />
                {brand.contact.email}
              </a>
            </li>
            <li className="flex items-start gap-3 text-muted">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" />
              <span>
                {brand.contact.address.line1}
                <br />
                {brand.contact.address.city}, {brand.contact.address.postcode}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Site</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/servicing" className="text-white hover:text-accent">Servicing</Link></li>
            <li><Link href="/repairs"   className="text-white hover:text-accent">Repairs</Link></li>
            <li><Link href="/mot"       className="text-white hover:text-accent">MOT</Link></li>
            <li><Link href="/about"     className="text-white hover:text-accent">About</Link></li>
            <li><Link href="/contact"   className="text-white hover:text-accent">Contact</Link></li>
          </ul>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/privacy" className="text-white hover:text-accent">Privacy</Link></li>
            <li><Link href="/terms"   className="text-white hover:text-accent">Terms of Use</Link></li>
            <li><Link href="/cookies" className="text-white hover:text-accent">Cookies</Link></li>
          </ul>
        </div>
      </div>

      {/* Business disclosure block — Companies Act / Trading Standards */}
      <div className="container-x mt-10 border-t border-line pt-6 text-[11px] leading-relaxed text-muted">
        <p>
          {brand.client.name} is a {legal.controller.structure.toLowerCase() === "tbd" ? "trading name" : legal.controller.structure.toLowerCase()} trading from {brand.contact.address.line1}, {brand.contact.address.city}, {brand.contact.address.postcode}.
          {isLtd && legal.controller.companyNumber !== "TBD" && (
            <> Registered in {legal.controller.placeOfRegistration} under company number {legal.controller.companyNumber}. Registered office: {legal.controller.registeredOffice}.</>
          )}
          {legal.controller.icoNumber !== "TBD" && (
            <> ICO registration {legal.controller.icoNumber}.</>
          )}
          {" "}“RAC Approved” is a trade mark of RAC Motoring Services and is used under licence.
        </p>
      </div>

      <div className="container-x mt-6 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-muted md:flex-row md:items-center">
        <p>© {year} {brand.client.name}. All rights reserved.</p>
        <p className="font-mono uppercase tracking-[0.18em]">Built by Fox27</p>
      </div>
    </footer>
  );
}
