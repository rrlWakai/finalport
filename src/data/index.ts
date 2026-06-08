import type { Project, TechItem, Philosophy, ServiceItem, NavLink, SocialLink } from '../types';

export const navLinks: NavLink[] = [
  { label: 'Projects', href: '#projects' },
  { label: 'Journey', href: '#journey' },
  { label: 'Services', href: '#services' },
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
      'AI-Powered Study Assistant transforming raw notes into structured knowledge bases using advanced LLMs.',
    tags: ['React', 'TypeScript', 'Gemini API', 'Supabase'],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBokIIMjuyK81MDFaNz_55avwjjWKU5OSlMZSL8Y5yRHgg4BtPzojJf6fzbkpNWby8ESipDGCC5Et1iO35EEjBYqfAmlg_FAEhgwl6vI6qCu0DivwJkb_g5bQdtmJ6aKi-6Dc8dIbkAxPOjb270i2Fex9CcSDl4CFIGqFRnSvNEbKfgMffzDDQ27kPP85_xnQkbcT_3zqnIpZh8MjuXXp95TUaLdmPVJ-KMwYOKphtW2DZrAET9khrhNtvgu76bzQWlKaTAtCGyJHk',
    cta: 'Explore Case Study',
  },
  {
    id: 'nexus-oms',
    title: 'Nexus OMS',
    description:
      'Enterprise-grade order management system designed for scale, precision, and lightning-fast logistics tracking.',
    tags: ['Node.js', 'React', 'MySQL', 'Supabase'],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3KF7qNBvUj2E-whH9yGbrcDN3RyehK6G-C-IAhwR02AtNe3I8Jl4tdh_eu2RjMKYRU0_F2geCt0dwhg3q-01p8fFQachpnVhQOzLNQtMpenz3cFuTElWLKQNspWyTmPnM_t9AwTsiNDuAJyhjhTMuw5FKKMAm3WkMWf51eD9gk5h4cDjpw7LWs_wuq7GBF6DtM2SOiQ9za_TAn60HYRaSic3en6kaGHbEfcT5IJhwZOpGhHFwp8aXDjQSl4nd8VLabLV_IKvqKS0',
    cta: 'Explore Case Study',
  },
  {
    id: 'portfolio-2024',
    title: 'Portfolio 2024',
    description:
      'A personal showcase of technical debt repayment and visual storytelling, built for high-performance metrics.',
    tags: ['Tailwind', 'Framer Motion', 'Vite'],
    isTextVisual: true,
    textVisual: 'PORTFOLIO',
    cta: 'Live Preview',
  },
];

export const techStack: TechItem[] = [
  { id: 'react', name: 'React', icon: 'Code2', delay: 0 },
  { id: 'typescript', name: 'TypeScript', icon: 'Terminal', delay: 0.5 },
  { id: 'tailwind', name: 'Tailwind', icon: 'Palette', delay: 1 },
  { id: 'supabase', name: 'Supabase', icon: 'Database', delay: 1.5 },
  { id: 'nodejs', name: 'Node.js', icon: 'Network', delay: 2 },
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
    id: 'web-dev',
    title: 'Web App Development',
    description: 'End-to-end solutions built with React and modern ecosystems.',
    icon: 'Monitor',
    highlighted: true,
  },
  {
    id: 'frontend',
    title: 'Frontend Design',
    description: 'Pixel-perfect, responsive interfaces that captivate users.',
    icon: 'Brush',
  },
  {
    id: 'backend',
    title: 'Backend Systems',
    description: 'Robust server-side logic and database architecture for heavy loads.',
    icon: 'Server',
  },
  {
    id: 'api',
    title: 'API Integration',
    description: 'Seamless connections between your app and the digital ecosystem.',
    icon: 'Share2',
  },
];
