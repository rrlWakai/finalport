import { motion } from 'framer-motion';
import { MagneticButton } from '../ui/MagneticButton';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] } as const,
});

function FormField({
  placeholder,
  type = 'text',
  isSelect = false,
  children,
}: {
  placeholder: string;
  type?: string;
  isSelect?: boolean;
  children?: React.ReactNode;
}) {
  const inputClasses =
    'w-full bg-transparent border-b border-black/10 py-4 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40';

  return (
    <div className="relative group">
      {isSelect ? (
        <select className={`${inputClasses} appearance-none`}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
    </div>
  );
}

export function Contact() {
  return (
    <section className="py-section-gap px-5 lg:px-margin-desktop" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-5">
          <motion.h2
            className="font-display-xl text-display-xl mb-8"
            {...fadeUp(0)}
          >
            Let&apos;s build something{' '}
            <span className="text-primary">meaningful.</span>
          </motion.h2>
          <motion.p
            className="font-body-lg text-body-lg text-on-surface-variant"
            {...fadeUp(0.1)}
          >
            Whether you have a fully-formed idea or just a spark of inspiration,
            I&apos;m here to help you bring it to life with precision and craft.
          </motion.p>
        </div>

        <motion.div className="lg:col-span-7" {...fadeUp(0)}>
          <form className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <FormField placeholder="Name" />
              <FormField placeholder="Email" type="email" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <FormField placeholder="Project Type" isSelect>
                <option>Project Type</option>
                <option>Web Application</option>
                <option>E-commerce</option>
                <option>Branding/UI</option>
              </FormField>
              <FormField placeholder="Budget Range" />
            </div>

            <div className="relative group">
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full bg-transparent border-b border-black/10 py-4 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40 resize-none"
              />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
            </div>

            <MagneticButton variant="primary" type="submit">
              Send Proposal
            </MagneticButton>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
