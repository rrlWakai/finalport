import { motion } from 'framer-motion';
import { philosophies } from '../../data';

export function Philosophies() {
  return (
    <section className="py-section-gap grid grid-cols-1 lg:grid-cols-12 gap-gutter px-5 lg:px-margin-desktop">
      <div className="lg:col-span-5">
        <h2 className="font-display-xl text-4xl sm:text-display-xl sticky top-40">
          Core <br />
          <span className="text-primary">Philosophies</span>
        </h2>
      </div>
      <div className="lg:col-span-7 space-y-32">
        {philosophies.map((philosophy, i) => (
          <motion.div
            key={philosophy.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="font-headline-lg text-headline-lg mb-6">{philosophy.title}</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {philosophy.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
