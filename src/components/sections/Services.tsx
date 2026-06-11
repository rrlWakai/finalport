import { motion } from 'framer-motion';
import {
  Building2, CalendarCheck, LayoutDashboard, Search,
  type LucideIcon,
} from 'lucide-react';
import { services } from '../../data';
import { MagneticButton } from '../ui/MagneticButton';

const iconMap: Record<string, LucideIcon> = {
  Building2, CalendarCheck, LayoutDashboard, Search,
};

export function Services() {
  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop" id="services">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16"
      >
        <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
          Services
        </span>
        <h2 className="font-display-xl text-4xl sm:text-display-xl mt-4 max-w-3xl">
          Everything you need{' '}
          <span className="text-primary">to start accepting direct bookings.</span>
        </h2>
      </motion.div>

      <div className="space-y-6">
        {services.map((service, i) => {
          const Icon = iconMap[service.icon] || Building2;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface-container border border-black/5 rounded-2xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 hover:border-primary/20 transition-colors duration-500"
            >
              <div className="lg:col-span-1">
                <div className="w-14 h-14 flex items-center justify-center bg-primary/10 rounded-xl">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
              </div>

              <div className="lg:col-span-7">
                <h3 className="font-headline-lg text-headline-lg mb-2">{service.title}</h3>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-4">
                  {service.tagline}
                </p>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3 text-on-surface-variant">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="font-body-md text-body-md">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-4 flex lg:justify-end items-start">
                <MagneticButton variant="ghost">
                  Inquire About This Service
                </MagneticButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
