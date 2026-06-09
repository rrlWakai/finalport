import type { Project, TechItem, TechCategory, Philosophy, ServiceItem, FaqItem, NavLink, SocialLink } from '../types';

export const navLinks: NavLink[] = [
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Twitter', href: '#' },
  { label: 'Email', href: '#' },
];

export const projects: Project[] = [
  {
    id: 'review-buddy',
    title: 'Review Buddy',
    description:
      'AI-powered study assistant transforming raw notes into structured knowledge bases using large language models. Built with React and TypeScript.',
    tags: ['React', 'TypeScript', 'Gemini API', 'Supabase'],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBokIIMjuyK81MDFaNz_55avwjjWKU5OSlMZSL8Y5yRHgg4BtPzojJf6fzbkpNWby8ESipDGCC5Et1iO35EEjBYqfAmlg_FAEhgwl6vI6qCu0DivwJkb_g5bQdtmJ6aKi-6Dc8dIbkAxPOjb270i2Fex9CcSDl4CFIGqFRnSvNEbKfgMffzDDQ27kPP85_xnQkbcT_3zqnIpZh8MjuXXp95TUaLdmPVJ-KMwYOKphtW2DZrAET9khrhNtvgu76bzQWlKaTAtCGyJHk',
    cta: 'Explore Case Study',
  },
  {
    id: 'nexus-oms',
    title: 'Nexus OMS',
    description:
      'Enterprise-grade order management system built with Node.js and React, designed for high-scale logistics tracking and precision inventory management.',
    tags: ['Node.js', 'React', 'MySQL', 'Supabase'],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3KF7qNBvUj2E-whH9yGbrcDN3RyehK6G-C-IAhwR02AtNe3I8Jl4tdh_eu2RjMKYRU0_F2geCt0dwhg3q-01p8fFQachpnVhQOzLNQtMpenz3cFuTElWLKQNspWyTmPnM_t9AwTsiNDuAJyhjhTMuw5FKKMAm3WkMWf51eD9gk5h4cDjpw7LWs_wuq7GBF6DtM2SOiQ9za_TAn60HYRaSic3en6kaGHbEfcT5IJhwZOpGhHFwp8aXDjQSl4nd8VLabLV_IKvqKS0',
    cta: 'Explore Case Study',
  },
  {
    id: 'portfolio-2024',
    title: 'Portfolio 2024',
    description:
      'High-performance portfolio website built with Vite, Tailwind CSS, and Framer Motion — optimized for Core Web Vitals and smooth animations.',
    tags: ['React', 'Tailwind CSS', 'Framer Motion', 'Vite'],
    isTextVisual: true,
    textVisual: 'PORTFOLIO',
    cta: 'Live Preview',
  },
];

export const categories: { id: TechCategory; label: string }[] = [
  { id: 'Frontend', label: 'Frontend' },
  { id: 'Backend', label: 'Backend' },
  { id: 'Databases', label: 'Databases' },
  { id: 'Mobile', label: 'Mobile Development' },
];

export const techStack: TechItem[] = [
  { id: 'react', name: 'React', category: 'Frontend', iconName: 'SiReact' },
  { id: 'typescript', name: 'TypeScript', category: 'Frontend', iconName: 'SiTypescript' },
  { id: 'javascript', name: 'JavaScript', category: 'Frontend', iconName: 'SiJavascript' },
  { id: 'html5', name: 'HTML5', category: 'Frontend', iconName: 'SiHtml5' },
  { id: 'css3', name: 'CSS3', category: 'Frontend', iconName: 'SiCss' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', iconName: 'SiTailwindcss' },
  { id: 'vite', name: 'Vite', category: 'Frontend', iconName: 'SiVite' },
  { id: 'nodejs', name: 'Node.js', category: 'Backend', iconName: 'SiNodedotjs' },
  { id: 'php', name: 'PHP', category: 'Backend', iconName: 'SiPhp' },
  { id: 'java', name: 'Java', category: 'Backend', iconName: 'SiOpenjdk' },
  { id: 'csharp', name: 'C#', category: 'Backend', iconName: 'SiSharp' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', iconName: 'SiPostgresql' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', iconName: 'SiMysql' },
  { id: 'supabase', name: 'Supabase', category: 'Databases', iconName: 'SiSupabase' },
  { id: 'react-native', name: 'React Native', category: 'Mobile', iconName: 'SiReact' },
  { id: 'flutter', name: 'Flutter', category: 'Mobile', iconName: 'SiFlutter' },
  { id: 'dart', name: 'Dart', category: 'Mobile', iconName: 'SiDart' },
];

export const philosophies: Philosophy[] = [
  {
    id: 'architecture',
    title: 'Clean Architecture',
    description:
      'Scalability is not an afterthought. I build modular, testable codebases that evolve alongside business needs, ensuring long-term maintainability and technical excellence.',
  },
  {
    id: 'performance',
    title: 'Performance First',
    description:
      'Lighthouse scores are my baseline. Every byte matters. I optimize assets, execution paths, and delivery mechanisms to ensure users never wait for a moment of interaction.',
  },
  {
    id: 'ux',
    title: 'Intuitive UX',
    description:
      'Technology should be invisible. I design interfaces that feel like natural extensions of the user\'s intent, utilizing motion and feedback to guide without friction.',
  },
];

export const services: ServiceItem[] = [
  {
    id: 'resort-websites',
    title: 'Resort Website Development',
    tagline: 'Direct-booking websites for Philippine resorts',
    description:
      'Custom resort websites with integrated booking systems that help hotels and resorts reduce OTA commission fees. Every site is built with React and TypeScript for fast load times, mobile-first responsiveness, and easy content management.',
    details: [
      'Real-time availability and booking calendar',
      'Online payment gateway integration',
      'Photo and video gallery with lightbox',
      'SEO-optimized room and amenity pages',
      'Mobile-first responsive design',
      'Supabase backend for reservation management',
    ],
    icon: 'Building2',
  },
  {
    id: 'villa-websites',
    title: 'Villa Website Development',
    tagline: 'Premium websites for private villa rentals',
    description:
      'Beautiful, conversion-focused websites for villa owners and property managers. Each villa site includes an intuitive booking flow, property showcase, and automated guest communication.',
    details: [
      'Custom villa listing and showcase pages',
      'Online booking with instant confirmation',
      'Automated email and SMS notifications',
      'Multi-property management dashboard',
      'Google Calendar and iCal sync',
      'Guest review and rating system',
    ],
    icon: 'Home',
  },
  {
    id: 'booking-systems',
    title: 'Booking System Development',
    tagline: 'Custom reservation platforms for any industry',
    description:
      'End-to-end booking and reservation systems built from the ground up. Whether you need a hotel booking engine, appointment scheduler, or rental reservation platform, I build custom solutions that fit your exact workflow.',
    details: [
      'Real-time availability management',
      'Secure payment processing (GCash, PayMaya, credit cards)',
      'Automated confirmations and reminders',
      'Admin dashboard with analytics',
      'Customer account management',
      'API integrations with third-party tools',
    ],
    icon: 'CalendarCheck',
  },
  {
    id: 'business-websites',
    title: 'Business Website Development',
    tagline: 'High-performance websites for Filipino businesses',
    description:
      'Professional business websites built with modern React and TypeScript. Fast loading, SEO-optimized, and designed to convert visitors into customers. Perfect for small and medium enterprises in the Philippines.',
    details: [
      'Custom design tailored to your brand',
      'SEO foundation with semantic HTML and meta tags',
      'Contact forms with email notifications',
      'Blog or news section for content marketing',
      'Google Analytics and conversion tracking',
      'Ongoing maintenance and support',
    ],
    icon: 'Briefcase',
  },
  {
    id: 'react-development',
    title: 'React & TypeScript Development',
    tagline: 'Expert React development for custom applications',
    description:
      'Specialized React and TypeScript development for dashboards, SaaS platforms, admin panels, and data-heavy web applications. I write clean, type-safe, testable code that scales with your business.',
    details: [
      'Custom React component libraries',
      'TypeScript for type safety and fewer bugs',
      'State management (Zustand, React Query)',
      'REST and GraphQL API integration',
      'Supabase backend and real-time subscriptions',
      'Performance optimization and Core Web Vitals',
    ],
    icon: 'Code2',
  },
];

export const faqs: FaqItem[] = [
  {
    question: 'What is a booking system and how does it work?',
    answer:
      'A booking system is a web application that lets customers check real-time availability, select dates, and reserve services online without human intervention. It works by connecting a frontend calendar interface to a database that tracks reservations, blocked dates, and pricing. When a customer books, the system automatically updates availability, sends confirmation emails, and can process payments. For resorts and villas, a booking system replaces manual phone or email reservations with an automated 24/7 solution that can increase direct bookings by 30–50%.',
  },
  {
    question: 'Why does a resort need a direct-booking website?',
    answer:
      'Resorts lose 15–25% of each booking to OTA commissions from platforms like Booking.com and Agoda. A direct-booking website eliminates those fees, putting that revenue back into the business. Beyond cost savings, a direct website gives resorts full control over their brand, guest data, and marketing. You can collect email addresses, offer loyalty discounts, and build a relationship with guests before they arrive. For Philippine resorts especially, a well-optimized direct site captures both local and international travelers searching for accommodations online.',
  },
  {
    question: 'How much does a custom website cost in the Philippines?',
    answer:
      'Custom website costs vary by complexity. A professional business website typically starts at ₱55,000–₱165,000 ($1,000–$3,000 USD). A resort or villa website with a booking system ranges from ₱165,000–₱440,000 ($3,000–$8,000 USD). Complex web applications with custom functionality, dashboards, and API integrations start at ₱440,000+ ($8,000+ USD). These are one-time development investments — hosting and maintenance are separate monthly costs. Every project includes a detailed scope document before work begins so there are no surprises.',
  },
  {
    question: 'Why choose React and TypeScript for business websites?',
    answer:
      'React delivers superior performance through its virtual DOM, which minimizes page re-renders and keeps load times fast — critical for Filipino users on mobile networks. TypeScript adds static typing that catches bugs during development rather than at runtime, reducing costly production issues by up to 40%. Together, React and TypeScript create websites that load quickly, are easier to maintain as your business grows, and have excellent SEO potential when paired with proper server-side rendering or static generation. Major companies like Facebook, Airbnb, and Shopify use the same technology stack.',
  },
  {
    question: 'What technologies do you use to build websites?',
    answer:
      'I specialize in React and TypeScript for frontend development, Supabase and PostgreSQL for backend and database, Node.js for server-side logic, and Tailwind CSS for styling. For booking systems, I implement real-time availability databases with Supabase\'s PostgreSQL and Realtime subscriptions. All websites are optimized for Google Core Web Vitals, built mobile-first, and tested across devices. I also integrate payment gateways like GCash, PayMaya, and Stripe for Philippine and international transactions.',
  },
  {
    question: 'Do you work with clients outside the Philippines?',
    answer:
      'Yes, I work with clients worldwide. While I am based in the Philippines and specialize in serving Filipino resorts, villas, and businesses, I also develop web applications for international clients. All communication is conducted in English, and I operate on a flexible schedule to accommodate different time zones. Past projects have included clients from the United States, Australia, and Singapore.',
  },
  {
    question: 'How long does it take to build a resort or villa website?',
    answer:
      'A typical resort or villa website with a booking system takes 6–10 weeks from kickoff to launch. The timeline breaks down as follows: planning and wireframing (1 week), design (1–2 weeks), development (3–4 weeks), testing and revisions (1–2 weeks), and launch (1 week). Simpler business websites without booking functionality can be completed in 3–5 weeks. I provide a detailed timeline in every project proposal before work begins.',
  },
];
