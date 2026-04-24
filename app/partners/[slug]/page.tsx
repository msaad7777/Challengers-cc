import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPartnerBySlug, getAllPartnerSlugs, type Partner } from '../data';

export async function generateStaticParams() {
  return getAllPartnerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);
  if (!partner) return { title: 'Partner Not Found' };
  return {
    title: `${partner.name} — ${partner.tier} | Challengers Cricket Club`,
    description: partner.tagline || partner.description.slice(0, 160),
  };
}

function TierBadge({ tier }: { tier: Partner['tier'] }) {
  const colors: Record<Partner['tier'], string> = {
    'Title Sponsor': 'bg-purple-500/20 border-purple-500/50 text-purple-300',
    'Platinum Sponsor': 'bg-gray-300/20 border-gray-300/50 text-gray-200',
    'Gold Sponsor': 'bg-accent-500/20 border-accent-500/50 text-accent-300',
    'Community Partner': 'bg-primary-500/20 border-primary-500/50 text-primary-300',
    'Coaching Partner': 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    'Official Partner': 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${colors[tier]}`}>
      {tier}
    </span>
  );
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = getPartnerBySlug(slug);
  if (!partner) notFound();

  const hasRestaurant = Boolean(partner.orderOnline?.length || partner.reservations || partner.menu);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-950 via-black to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            {partner.logo && (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden mb-6 bg-white flex items-center justify-center p-3">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={160}
                  height={160}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <TierBadge tier={partner.tier} />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4 mb-2">
              <span className="gradient-text">{partner.name}</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-2">{partner.category}</p>
            <p className="text-gray-500 text-sm">{partner.location}</p>
            {partner.tagline && (
              <p className="text-gray-300 text-lg md:text-xl mt-6 max-w-2xl italic">
                &ldquo;{partner.tagline}&rdquo;
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {partner.phone && (
              <a
                href={`tel:${partner.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            )}
            {partner.email && (
              <a
                href={`mailto:${partner.email}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            )}
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </a>
            )}
            {partner.menu && (
              <a
                href={partner.menu}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Menu
              </a>
            )}
            {partner.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/50 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Directions
              </a>
            )}
          </div>

          {/* Order CTAs — primary gradient buttons */}
          {hasRestaurant && (
            <div className="flex flex-wrap justify-center gap-3">
              {partner.orderOnline?.map((order) => (
                <a
                  key={order.url}
                  href={order.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold shadow-xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {order.label}
                </a>
              ))}
              {partner.reservations && (
                <a
                  href={partner.reservations}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-500 rounded-lg font-semibold shadow-xl hover:shadow-accent-500/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reservations
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              About <span className="gradient-text">{partner.name}</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">{partner.description}</p>
          </div>
        </div>
      </section>

      {/* Hours + Address */}
      {(partner.hours?.length || partner.address) && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {partner.hours && partner.hours.length > 0 && (
              <div className="glass rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hours
                </h3>
                <ul className="space-y-2 text-gray-300">
                  {partner.hours.map((h, i) => (
                    <li key={i} className="flex justify-between gap-4">
                      <span className="font-semibold text-white">{h.days}</span>
                      <span>{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {partner.address && (
              <div className="glass rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </h3>
                <p className="text-gray-300 mb-4">{partner.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm"
                >
                  Open in Google Maps
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Signature Items */}
      {partner.signatureItems && partner.signatureItems.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Signature <span className="gradient-text">Favourites</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {partner.signatureItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Match Day Note (flexible text — travel stop angle for Curry Culture) */}
      {partner.matchDayNote && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 md:p-10 border-2 border-accent-500/30 bg-gradient-to-r from-accent-500/5 to-primary-500/5">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 text-accent-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">Match Day Note for Challengers</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{partner.matchDayNote}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {partner.testimonial && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="border-l-4 border-primary-500 pl-6 text-left">
              <p className="text-gray-300 text-xl italic leading-relaxed mb-3">
                &ldquo;{partner.testimonial.quote}&rdquo;
              </p>
              <cite className="text-gray-400 not-italic">— {partner.testimonial.attribution}</cite>
            </blockquote>
          </div>
        </section>
      )}

      {/* Read full story on blog */}
      {partner.blogSlug && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              href={`/blog/${partner.blogSlug}`}
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              Read the full Sponsor Spotlight on our blog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Full contact footer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-10">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Visit <span className="gradient-text">{partner.name}</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-gray-300">
              {partner.address && (
                <div>
                  <span className="text-gray-500 text-sm block mb-1">Address</span>
                  {partner.address}
                </div>
              )}
              {partner.phone && (
                <div>
                  <span className="text-gray-500 text-sm block mb-1">Phone</span>
                  <a href={`tel:${partner.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-primary-400 transition-colors">
                    {partner.phone}
                  </a>
                </div>
              )}
              {partner.email && (
                <div>
                  <span className="text-gray-500 text-sm block mb-1">Email</span>
                  <a href={`mailto:${partner.email}`} className="hover:text-primary-400 transition-colors break-all">
                    {partner.email}
                  </a>
                </div>
              )}
              {partner.website && (
                <div>
                  <span className="text-gray-500 text-sm block mb-1">Website</span>
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors break-all">
                    {partner.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
              {partner.instagram && (
                <div>
                  <span className="text-gray-500 text-sm block mb-1">Instagram</span>
                  <a
                    href={`https://instagram.com/${partner.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-400 transition-colors"
                  >
                    {partner.instagram}
                  </a>
                </div>
              )}
              {partner.whatsapp && (
                <div>
                  <span className="text-gray-500 text-sm block mb-1">WhatsApp</span>
                  <a href={partner.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                    Message on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            {partner.name} is a proud {partner.tier} of Challengers Cricket Club.
            Supporting our partners means supporting the club — mention Challengers CC when you visit!
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
