import Hero from '@/components/Hero';
import About from '@/components/About';
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
      <Hero />
      <About />
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
