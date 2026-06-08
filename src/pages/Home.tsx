import { Hero } from '../components/sections/Hero';
import { Journey } from '../components/sections/Journey';
import { Services } from '../components/sections/Services';
import { Projects } from '../components/sections/Projects';
import { TechStack } from '../components/sections/TechStack';
import { Philosophies } from '../components/sections/Philosophies';
import { Faq } from '../components/sections/Faq';
import { Contact } from '../components/sections/Contact';

export function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Projects />
      <Journey />
      <TechStack />
      <Philosophies />
      <Faq />
      <Contact />
    </main>
  );
}
