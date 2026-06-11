export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  isTextVisual?: boolean;
  textVisual?: string;
  cta: string;
  ctaIcon?: string;
  url?: string;
}

export type TechCategory = 'Frontend' | 'Backend' | 'Databases' | 'Integrations';

export interface TechItem {
  id: string;
  name: string;
  category: TechCategory;
  iconName: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  details: string[];
  icon: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  problem: string;
  solution: string;
  features: string[];
  businessValue: string[];
  techStack: string[];
  imageUrl: string;
  cta: string;
}
