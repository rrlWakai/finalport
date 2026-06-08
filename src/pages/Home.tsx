import { Hero } from '../components/sections/Hero';
import { Journey } from '../components/sections/Journey';
import { Projects } from '../components/sections/Projects';
import { TechStack } from '../components/sections/TechStack';
import { Philosophies } from '../components/sections/Philosophies';
import { Services } from '../components/sections/Services';
import { Contact } from '../components/sections/Contact';

export function Home() {
  return (
    <main>
      <Hero />
      <Journey />
      <Projects />
      <TechStack />
      <Philosophies />
      <Services />
      <Contact />
    </main>
  );
}
