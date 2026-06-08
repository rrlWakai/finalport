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
}

export interface TechItem {
  id: string;
  name: string;
  icon: string;
  delay: number;
}

export interface Philosophy {
  id: string;
  title: string;
  description: string;
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
