import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GalleryPreview from "@/components/GalleryPreview";
import Hero from "@/components/Hero";
import MudraShowcase from "@/components/MudraShowcase";
import Navbar from "@/components/Navbar";
import MobileActionBar from "@/components/MobileActionBar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <MudraShowcase />
      <GalleryPreview />
      <Contact />
      <Footer />
      <MobileActionBar />
    </main>
  );
}
