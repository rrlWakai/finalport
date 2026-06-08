import { motion } from 'framer-motion';
import { Monitor, Brush, Server, Share2, type LucideIcon } from 'lucide-react';
import { services } from '../../data';
import { GlassCard } from '../ui/GlassCard';

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Brush,
  Server,
  Share2,
};

export function Services() {
  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop" id="services">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {services.map((service, i) => {
          const Icon = iconMap[service.icon] || Monitor;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard
                className={`p-10 rounded-2xl h-full ${
                  service.highlighted ? 'border-t-2 border-t-primary/40' : ''
                }`}
              >
                <Icon className="text-primary w-10 h-10 mb-6" />
                <h4 className="font-headline-lg-mobile text-headline-lg-mobile mb-4">
                  {service.title}
                </h4>
                <p className="text-on-surface-variant">{service.description}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
