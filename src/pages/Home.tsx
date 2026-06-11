import { Hero } from '../components/sections/Hero';
import { CaseStudy } from '../components/sections/CaseStudy';
import { Services } from '../components/sections/Services';
import { Projects } from '../components/sections/Projects';
import { WhyWorkWithMe } from '../components/sections/WhyWorkWithMe';
import { TechStack } from '../components/sections/TechStack';
import { Faq } from '../components/sections/Faq';
import { Contact } from '../components/sections/Contact';

export function Home() {
  return (
    <main>
      <Hero />
      <CaseStudy />
      <Services />
      <Projects />
      <WhyWorkWithMe />
      <TechStack />
      <Faq />
      <Contact />
    </main>
  );
}
