import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import MudraShowcase from "@/components/MudraShowcase";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <MudraShowcase />
      {/* Phase 3: Gallery, Contact, Footer */}
    </main>
  );
}
