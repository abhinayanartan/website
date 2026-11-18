import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GalleryPreview from "@/components/GalleryPreview";
import Hero from "@/components/Hero";
import FirstVisit from "@/components/FirstVisit";
import MudraShowcase from "@/components/MudraShowcase";
import Navbar from "@/components/Navbar";
import MobileActionBar from "@/components/MobileActionBar";
import StudioJourney from "@/components/StudioJourney";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StudioJourney />
      <About />
      <MudraShowcase />
      <GalleryPreview />
      <FirstVisit />
      <Contact />
      <Footer />
      <MobileActionBar />
    </main>
  );
}
