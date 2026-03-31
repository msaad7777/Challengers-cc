import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import VerifiedBanner from '@/components/VerifiedBanner';
import SponsorshipBanner from '@/components/SponsorshipBanner';
import Programs from '@/components/Programs';
import Partners from '@/components/Partners';
import BoardMembers from '@/components/BoardMembers';
import Registration from '@/components/Registration';
import Contact from '@/components/Contact';
import LegalDocuments from '@/components/LegalDocuments';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <VerifiedBanner />
      <SponsorshipBanner />
      <Programs />
      <Partners />
      <BoardMembers />
      <Registration />
      <Contact />
      <LegalDocuments />
      <Footer />
    </main>
  );
}
