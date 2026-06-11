import { motion } from 'framer-motion';

const reasons = [
  {
    title: 'I build booking systems — not just websites',
    description:
      'Most developers build brochure sites. I build operational systems: real-time availability engines, payment-connected booking flows, and admin dashboards that replace manual work. Your site processes reservations, not just page views.',
  },
  {
    title: 'You work directly with the engineer',
    description:
      'No account managers, no handoffs, no agency markup. From our first conversation to launch and beyond, I am the person building your system. This means faster decisions, clearer communication, and a single point of accountability.',
  },
  {
    title: 'Mobile-first, built for how guests actually book',
    description:
      'Most travelers research and book from their phones — especially in the Philippines. Every system I build is designed mobile-first, tested on real devices, and optimized for the network conditions your guests actually experience.',
  },
  {
    title: 'Long-term support, not build-and-abandon',
    description:
      'After your site launches, I stay available for updates, changes, and questions. Need to add a new room type? Update rates during peak season? I handle it so your site stays current without you needing to learn technical skills.',
  },
];

export function WhyWorkWithMe() {
  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16"
      >
        <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
          Why Work With Me
        </span>
        <h2 className="font-display-xl text-4xl sm:text-display-xl mt-4 max-w-3xl">
          Built for hospitality.{' '}
          <span className="text-primary">Backed by real experience.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-5 space-y-16">
          {reasons.slice(0, 2).map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-headline-lg text-headline-lg mb-4">{reason.title}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="lg:col-span-2" />
        <div className="lg:col-span-5 space-y-16 mt-16 lg:mt-0">
          {reasons.slice(2).map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i + 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-headline-lg text-headline-lg mb-4">{reason.title}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
