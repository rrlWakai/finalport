import type { Project } from '../types';

export const carouselProjects: Project[] = [
  {
    id: 'premier-pool-house',
    title: 'Premier Pool House & Premier Patio',
    subtitle: 'Direct Booking Platform for Resorts',
    category: 'Booking / Reservation System',
    type: 'CLIENT PROJECT',
    status: 'production',
    description:
      'Production online reservation system processing real bookings for two rental properties. Real-time availability, online payments via PayMongo, multi-property management.',
    problem:
      'Resorts relied on Facebook messages and manual calendars, causing booking conflicts and missed revenue.',
    solution:
      'Built a custom online reservation system with real-time availability, day/night/overnight booking modes, and PayMongo payments. Owners manage everything from a single dashboard.',
    features: [
      'Real-time availability calendar',
      'Day / Night / Overnight booking modes',
      'Online payments via PayMongo',
      'Admin reservation dashboard',
      'Calendar blocking',
      'Discount system',
      'Multi-property support',
    ],
    technologies: ['React', 'TypeScript', 'Supabase', 'PayMongo'],
    image: '',
    caseStudyId: 'premier-pool-house',
    year: '2026',
    featured: true,
  },
  {
    id: 'yuh-rum',
    title: 'Yuh-Rum',
    subtitle: 'Villa Booking Experience',
    category: 'Villa Booking Platform',
    type: 'LIVE PROJECT',
    status: 'live',
    description:
      'Full-service villa booking platform with multi-step reservation flow, PayMongo payments, admin dashboard, and real-time availability management.',
    problem:
      'Vacation rentals need branded direct-booking experiences to reduce OTA dependence.',
    solution:
      'Built a full-stack villa booking platform with multi-step reservation flow, payment processing via PayMongo, and an admin dashboard for managing bookings and availability.',
    features: [
      'Multi-step reservation flow',
      'Online payments via PayMongo',
      'Admin dashboard',
      'Real-time availability management',
    ],
    technologies: ['React', 'TypeScript', 'Supabase', 'PayMongo'],
    image: 'yuhrum',
    demoUrl: 'https://yuh-rum.vercel.app/',
    year: '2026',
    featured: true,
  },
  {
    id: 'nexus-oms',
    title: 'Nexus OMS',
    subtitle: 'Reservation & Inventory Engine',
    category: 'Order Management System',
    type: 'SYSTEM PROJECT',
    status: 'showcase',
    description:
      'Reservation and inventory management engine with real-time availability tracking, conflict detection, and order lifecycle management. Core logic transfers directly to booking systems.',
    problem:
      'Businesses need reliable inventory tracking and conflict-free reservation management.',
    solution:
      'Engineered a reservation and inventory management engine with real-time availability tracking, conflict detection, and full order lifecycle management.',
    features: [
      'Real-time availability tracking',
      'Conflict detection',
      'Order lifecycle management',
      'Multi-channel inventory sync',
    ],
    technologies: ['Node.js', 'React', 'MySQL', 'Supabase'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3KF7qNBvUj2E-whH9yGbrcDN3RyehK6G-C-IAhwR02AtNe3I8Jl4tdh_eu2RjMKYRU0_F2geCt0dwhg3q-01p8fFQachpnVhQOzLNQtMpenz3cFuTElWLKQNspWyTmPnM_t9AwTsiNDuAJyhjhTMuw5FKKMAm3WkMWf51eD9gk5h4cDjpw7LWs_wuq7GBF6DtM2SOiQ9za_TAn60HYRaSic3en6kaGHbEfcT5IJhwZOpGhHFwp8aXDjQSl4nd8VLabLV_IKvqKS0',
    year: '2026',
    featured: true,
  },
  {
    id: 'review-buddy',
    title: 'Review Buddy',
    subtitle: 'AI-Powered Learning Assistant',
    category: 'AI / Content Tool',
    type: 'AI PROJECT',
    status: 'showcase',
    description:
      'AI-powered content management tool that transforms unstructured information into structured, publish-ready formats using the Gemini API.',
    problem:
      'Students struggle to organize and retain study materials efficiently.',
    solution:
      'Built an AI-powered tool that accepts unstructured content and transforms it into structured, publish-ready formats with minimal manual effort.',
    features: [
      'AI-powered content transformation',
      'Gemini API integration',
      'Structured output generation',
      'Publish-ready formatting',
    ],
    technologies: ['React', 'TypeScript', 'Gemini API', 'Supabase'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBokIIMjuyK81MDFaNz_55avwjjWKU5OSlMZSL8Y5yRHgg4BtPzojJf6fzbkpNWby8ESipDGCC5Et1iO35EEjBYqfAmlg_FAEhgwl6vI6qCu0DivwJkb_g5bQdtmJ6aKi-6Dc8dIbkAxPOjb270i2Fex9CcSDl4CFIGqFRnSvNEbKfgMffzDDQ27kPP85_xnQkbcT_3zqnIpZh8MjuXXp95TUaLdmPVJ-KMwYOKphtW2DZrAET9khrhNtvgu76bzQWlKaTAtCGyJHk',
    year: '2026',
    featured: false,
  },
];
