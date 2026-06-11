import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { projects } from '../../data';
import { SectionHeading } from '../ui/SectionHeading';
import { TechTag } from '../ui/TechTag';
import yuhrumImg from '../../assets/yuhrum.png';

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const isTextLeft = index % 2 === 0;

  const textCol = (
    <div className="col-span-12 lg:col-span-5 p-6 lg:p-12 flex flex-col justify-between h-full">
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
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-4 font-label-caps text-label-caps uppercase text-primary mt-8 hover:opacity-80 transition-opacity"
        >
          {project.cta}
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      ) : (
        <button className="group inline-flex items-center gap-4 font-label-caps text-label-caps uppercase text-primary mt-8">
          {project.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );

  const imageCol = (
    <div className="hidden lg:flex col-span-7 bg-surface-container-highest overflow-hidden items-center justify-center p-16">
      {project.id === 'yuh-rum' ? (
        <img
          src={yuhrumImg}
          alt="Yuh-Rum villa booking platform preview"
          className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
        />
      ) : project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={`${project.title} Preview`}
          className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
          loading="lazy"
        />
      ) : (
        <span className="font-display-xl text-5xl lg:text-7xl text-primary/20 font-bold select-none text-center leading-tight">
          Premier<br />Pool House
        </span>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface-container border border-black/5 rounded-2xl lg:rounded-3xl overflow-hidden grid grid-cols-12 min-h-[50vh] lg:h-[60vh] shadow-2xl"
    >
      {isTextLeft ? (
        <>{textCol}{imageCol}</>
      ) : (
        <>{imageCol}{textCol}</>
      )}
    </motion.div>
  );
}

export function Projects() {
  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop" id="projects">
      <SectionHeading label="Additional Projects" className="mb-4" />
      <h2 className="font-display-xl text-4xl sm:text-display-xl mb-4 max-w-3xl">
        More examples{' '}
        <span className="text-primary">of what I build.</span>
      </h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-16 max-w-2xl">
        From full villa booking platforms to AI-powered tools and inventory systems
        — each project solves a real operational problem.
      </p>
      <div className="space-y-8">
        {projects.slice(1).map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
