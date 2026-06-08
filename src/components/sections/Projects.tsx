import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { projects } from '../../data';
import { SectionHeading } from '../ui/SectionHeading';
import { TechTag } from '../ui/TechTag';

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({
  project,
}: {
  project: (typeof projects)[number];
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 15%',
        end: 'bottom 15%',
        onUpdate: (self) => {
          const progress = self.progress;
          const scale = 1 - progress * 0.05;
          const opacity = 1 - progress * 0.4;
          const y = progress * -20;
          gsap.set(card, { scale, opacity, y });
        },
      });
    }, card);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-[15vh] bg-surface-container border border-black/5 rounded-2xl lg:rounded-3xl overflow-hidden grid grid-cols-12 min-h-[50vh] lg:h-[70vh] shadow-2xl"
    >
      <div className="col-span-12 lg:col-span-5 p-6 lg:p-12 flex flex-col justify-between">
        <div>
          <h3 className="font-headline-lg text-headline-lg mb-4">{project.title}</h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <TechTag key={tag} label={tag} />
            ))}
          </div>
        </div>
        <button className="group flex items-center gap-4 font-label-caps text-label-caps uppercase text-primary mt-8">
          {project.cta}
          {project.cta === 'Live Preview' ? (
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          ) : (
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>
      <div className="hidden lg:block col-span-7 bg-surface-container-highest overflow-hidden">
        {project.isTextVisual && project.textVisual ? (
          <div className="w-full h-full flex items-center justify-center p-20">
            <span className="text-[200px] font-bold text-black/5 select-none rotate-12">
              {project.textVisual}
            </span>
          </div>
        ) : (
          <img
            src={project.imageUrl}
            alt={`${project.title} Preview`}
            className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
    </motion.div>
  );
}

export function Projects() {
  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop" id="projects">
      <SectionHeading label="Selected Works" className="mb-16" />
      <div className="space-y-[10vh] pb-[20vh]">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
