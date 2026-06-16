import { ArrowRight } from 'lucide-react';
import type { Project } from '../../types';
import yuhrumImg from '../../assets/yuhrum.png';
import premierImg from '../../assets/premier.png';

interface ProjectCardProps {
  project: Project;
  cardWidth: number;
}

const projectImages: Record<string, string | undefined> = {
  'premier-pool-house': premierImg,
  'yuh-rum': yuhrumImg,
};

export function ProjectCard({ project, cardWidth }: ProjectCardProps) {
  const imgSrc = (projectImages[project.id] ?? project.image) || undefined;
  const hasImage = !!imgSrc;

  if (!hasImage) {
    return (
      <div
        className="relative w-full h-full rounded-[32px] overflow-hidden select-none flex items-center justify-center bg-[#0a0a0a]"
        style={{
          width: cardWidth,
          border: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <span className="text-white/10 text-5xl lg:text-6xl font-bold text-center leading-tight px-8">
          {project.title}
        </span>
      </div>
    );
  }

  return (
    <div
      className="group relative w-full h-full rounded-[32px] overflow-hidden select-none bg-[#0a0a0a]"
      style={{
        width: cardWidth,
        border: '1px solid rgba(255,255,255,.06)',
      }}
    >
      <img
        src={imgSrc}
        alt={`${project.title} Preview`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.55) 35%, rgba(0,0,0,.05) 100%)',
        }}
      />

      <div className="absolute left-[40px] bottom-[40px] z-10 max-w-[460px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-[.18em] uppercase font-medium text-white/60">
              {project.type}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
            <span className="text-[11px] tracking-[.18em] uppercase font-medium text-white/50">
              {project.year}
            </span>
          </div>

          <h3
            className="font-bold text-white text-balance"
            style={{
              fontSize: 'clamp(2rem, 3vw, 3.2rem)',
              lineHeight: '.95',
              letterSpacing: '-0.04em',
              maxWidth: '420px',
            }}
          >
            {project.title}
          </h3>

          <p
            className="line-clamp-3"
            style={{
              fontSize: '1rem',
              lineHeight: '1.75',
              letterSpacing: '-0.01em',
              maxWidth: '440px',
              color: 'rgba(255,255,255,.96)',
              textShadow: '0 1px 2px rgba(0,0,0,.35)',
            }}
          >
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-[12px] tracking-wider text-white/55 px-[14px] py-[8px] rounded-full"
                style={{
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.08)',
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          {(project.caseStudyId || project.demoUrl) && (
            <div>
              {project.caseStudyId && (
                <a
                  href="#case-study"
                  className="group/link inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-all duration-200"
                >
                  View Case Study
                  <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform duration-200" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
