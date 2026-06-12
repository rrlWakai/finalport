import { motion } from 'framer-motion';
import { caseStudy } from '../../data';
import { SectionHeading } from '../ui/SectionHeading';
import { TechTag } from '../ui/TechTag';
import { MagneticButton } from '../ui/MagneticButton';
import { scrollToSection } from '../../lib/scroll';
import caseImg from '../../assets/case.png';

export function CaseStudy() {
  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop" id="case-study">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16"
      >
        <SectionHeading label="Featured Case Study" className="mb-4" />
        <h2 className="font-display-xl text-4xl sm:text-display-xl max-w-3xl">
          {caseStudy.title}
        </h2>
        <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest mt-4">
          {caseStudy.subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-20">
        {/* Problem */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3 block">
              The Problem
            </span>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {caseStudy.problem}
            </p>
          </motion.div>
        </div>

        {/* Solution */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3 block">
              The Solution
            </span>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {caseStudy.solution}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-2xl mb-20 overflow-hidden border border-black/5"
      >
        <a href="https://premier-rentalss-7x33.vercel.app/" target="_blank" rel="noopener noreferrer">
          <img
            src={caseImg}
            alt="Premier Pool House booking system interface"
            className="w-full h-auto object-cover hover:opacity-95 transition-opacity"
          />
        </a>
      </motion.div>

      {/* Features */}
      <div className="mb-20">
        <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-8 block">
          Key Features
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseStudy.features.map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface-container border border-black/5 rounded-xl p-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary block mb-4" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                {feature}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Business Value */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-20">
        <div className="lg:col-span-4">
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest block">
            Business Value
          </span>
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {caseStudy.businessValue.map((value, i) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4"
            >
              <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                {value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech stack — visually small */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-3 mb-12"
      >
        <span className="font-label-caps text-label-caps text-on-surface-variant/50 uppercase tracking-widest mr-2">
          Built with:
        </span>
        {caseStudy.techStack.map((tech) => (
          <TechTag key={tech} label={tech} />
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <MagneticButton variant="primary" onClick={() => scrollToSection('contact')}>
          Want a Booking System Like This?
        </MagneticButton>
      </motion.div>
    </section>
  );
}
