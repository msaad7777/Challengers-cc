import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import VerifiedBanner from '@/components/VerifiedBanner';
import SponsorshipBanner from '@/components/SponsorshipBanner';
import Programs from '@/components/Programs';
import LiveStreaming from '@/components/LiveStreaming';
import Partners from '@/components/Partners';
import BoardMembers from '@/components/BoardMembers';
import Registration from '@/components/Registration';
import Contact from '@/components/Contact';
import LegalDocuments from '@/components/LegalDocuments';
import PublicLiveScore from '@/components/PublicLiveScore';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      {/* Live score banner — visible to anyone, no login required.
          Auto-disappears when no match is active. */}
      <div className="pt-28 md:pt-32">
        <PublicLiveScore />
      </div>
      <Hero />
      <About />
      <VerifiedBanner />
      <SponsorshipBanner />
      <Programs />
      <LiveStreaming />
      <Partners />
      <BoardMembers />
      <Registration />
      <Contact />
      <LegalDocuments />
      <Footer />
    </main>
  );
}
