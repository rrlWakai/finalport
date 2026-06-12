import type { Project, TechItem, TechCategory, ServiceItem, FaqItem, NavLink, SocialLink, CaseStudy } from '../types';

export const navLinks: NavLink[] = [
  { label: 'Case Study', href: '#case-study' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/rrlWakai' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rhen-rhen-a-lumbo-2b381a393/' },
  { label: 'Facebook', href: 'https://www.facebook.com/Wakai.Imaushi' },
  { label: 'Email', href: 'mailto:lumborhenrhena@gmail.com' },
];

export const caseStudy: CaseStudy = {
  id: 'premier-pool-house',
  title: 'Premier Pool House & Premier Patio',
  subtitle: 'Custom Online Reservation System',
  problem:
    'Premier Pool House and Premier Patio are rental properties that relied entirely on Facebook messages, phone calls, and manual calendars to manage reservations. As bookings grew, tracking availability across multiple spaces — day rentals, night rentals, and overnight stays — became error-prone. Double-bookings risked guest trust, and there was no way to accept online payments or automate confirmations.',
  solution:
    'Built a custom online reservation system with real-time availability management, support for day/night/overnight booking modes, and online payment processing via PayMongo. Property owners now manage all reservations, calendar blocking, and discounts from a single dashboard — while guests book instantly without any manual back-and-forth.',
  features: [
    'Real-time availability calendar — guests see exactly what\'s free, preventing double-bookings',
    'Day / Night / Overnight booking modes — supports the unique rental structure of each property',
    'Online payments via PayMongo — guests pay securely with GCash, card, or bank transfer at booking',
    'Admin reservation dashboard — manage all bookings, check-ins, and guest data from one screen',
    'Calendar blocking — block dates for maintenance, private events, or personal use with one click',
    'Discount system — run promotions and seasonal offers without manual price recalculations',
    'Multi-property support — manage both Premier Pool House and Premier Patio under one system',
  ],
  businessValue: [
    'Direct bookings — guests book without calling, reducing phone tag and missed opportunities',
    'Less manual work — automated confirmations and calendar sync eliminate manual data entry',
    'Better reservation management — real-time availability prevents overbookings and conflicts',
    'Better guest experience — instant booking, online payment, and automatic confirmation',
  ],
  techStack: ['React', 'TypeScript', 'Supabase', 'PayMongo', 'Tailwind CSS'],
  imageUrl: '',
  cta: 'Want a booking system like this for your property?',
};

export const projects: Project[] = [
  {
    id: 'premier-pool-house',
    title: 'Premier Pool House & Premier Patio',
    description:
      'Production online reservation system processing real bookings. Real-time availability, online payments, multi-property management.',
    tags: ['React', 'TypeScript', 'Supabase', 'PayMongo'],
    imageUrl: '',
    cta: 'View Case Study',
  },
  {
    id: 'yuh-rum',
    title: 'Yuh-Rum',
    description:
      'Full-service villa booking platform with multi-step reservation flow, PayMongo payments, admin dashboard, and real-time availability management.',
    tags: ['React', 'TypeScript', 'Supabase', 'PayMongo'],
    imageUrl: '',
    cta: 'Visit Website',
    url: 'https://yuh-rum.vercel.app/',
  },
  {
    id: 'review-buddy',
    title: 'Review Buddy',
    description:
      'AI-powered content management tool that transforms unstructured information into structured, publish-ready formats. Demonstrates AI integration and automation capabilities.',
    tags: ['React', 'TypeScript', 'Gemini API', 'Supabase'],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBokIIMjuyK81MDFaNz_55avwjjWKU5OSlMZSL8Y5yRHgg4BtPzojJf6fzbkpNWby8ESipDGCC5Et1iO35EEjBYqfAmlg_FAEhgwl6vI6qCu0DivwJkb_g5bQdtmJ6aKi-6Dc8dIbkAxPOjb270i2Fex9CcSDl4CFIGqFRnSvNEbKfgMffzDDQ27kPP85_xnQkbcT_3zqnIpZh8MjuXXp95TUaLdmPVJ-KMwYOKphtW2DZrAET9khrhNtvgu76bzQWlKaTAtCGyJHk',
    cta: 'Explore Project',
  },
  {
    id: 'nexus-oms',
    title: 'Nexus OMS',
    description:
      'Reservation and inventory management engine with real-time availability tracking, conflict detection, and order lifecycle management. Core logic transfers directly to booking systems.',
    tags: ['Node.js', 'React', 'MySQL', 'Supabase'],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3KF7qNBvUj2E-whH9yGbrcDN3RyehK6G-C-IAhwR02AtNe3I8Jl4tdh_eu2RjMKYRU0_F2geCt0dwhg3q-01p8fFQachpnVhQOzLNQtMpenz3cFuTElWLKQNspWyTmPnM_t9AwTsiNDuAJyhjhTMuw5FKKMAm3WkMWf51eD9gk5h4cDjpw7LWs_wuq7GBF6DtM2SOiQ9za_TAn60HYRaSic3en6kaGHbEfcT5IJhwZOpGhHFwp8aXDjQSl4nd8VLabLV_IKvqKS0',
    cta: 'Explore Project',
  },
];

export const categories: { id: TechCategory; label: string }[] = [
  { id: 'Frontend', label: 'Frontend' },
  { id: 'Backend', label: 'Backend' },
  { id: 'Databases', label: 'Databases' },
  { id: 'Integrations', label: 'Integrations & Payments' },
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
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', iconName: 'SiPostgresql' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', iconName: 'SiMysql' },
  { id: 'supabase', name: 'Supabase', category: 'Databases', iconName: 'SiSupabase' },
  { id: 'paymongo', name: 'PayMongo', category: 'Integrations', iconName: 'SiPaymongo' },
  { id: 'api', name: 'REST APIs', category: 'Integrations', iconName: 'SiApif' },
];

export const services: ServiceItem[] = [
  {
    id: 'resort-websites',
    title: 'Resort Website Development',
    tagline: 'Turn browsers into bookers',
    description:
      'A resort website should do one thing well: convert visitors into guests. I build fast, mobile-optimized websites that showcase your property, make room selection intuitive, and guide guests straight to booking — with no distractions, no friction, and no unnecessary steps.',
    details: [
      'Showcase your property with a gallery that makes guests want to book',
      'Mobile-first design built for travelers browsing on phones',
      'Room and amenity pages optimized to answer guest questions before they ask',
      'Google-friendly structure so travelers find you before your competitors',
      'Easy content updates so you can publish rates, promos, and news yourself',
    ],
    icon: 'Building2',
  },
  {
    id: 'online-reservation',
    title: 'Online Reservation System',
    tagline: 'Accept bookings 24/7 — no phone tag, no manual calendars',
    description:
      'Most resorts still manage reservations through Facebook messages, phone calls, and paper logs. An online reservation system changes that. Guests check real-time availability, book their preferred accommodation, and receive instant confirmation — all without needing to call. You get a centralized dashboard to manage every reservation, block dates instantly, and never double-book again.',
    details: [
      'Real-time availability calendar — guests see what\'s free, you see what\'s booked',
      'Automatic confirmation emails and reminders — fewer no-shows, less guest follow-up',
      'Accept payments through GCash, PayMaya, and bank transfers',
      'Block dates instantly for maintenance, private events, or off-season closures',
      'Guest management dashboard with booking history and contact details',
    ],
    icon: 'CalendarCheck',
  },
  {
    id: 'management-dashboard',
    title: 'Resort Management Dashboard',
    tagline: 'See your entire operation from one screen',
    description:
      'Managing a resort means juggling reservations, guest inquiries, room availability, and staff coordination. A management dashboard brings everything into one secure, web-based control panel — accessible from your phone, tablet, or computer. Check today\'s check-ins, review pending bookings, update rates, and message guests without switching between apps.',
    details: [
      'At-a-glance dashboard showing today\'s arrivals, departures, and occupancy',
      'Manage multiple room types, rates, and seasonal pricing from one panel',
      'Guest messaging — send check-in instructions, promo offers, and follow-ups',
      'Export reports for accounting, tax, and performance analysis',
      'Staff access controls so each team member sees only what they need',
    ],
    icon: 'LayoutDashboard',
  },
  {
    id: 'seo-local-search',
    title: 'SEO & Local Search Optimization',
    tagline: 'Get found by travelers searching for your area',
    description:
      'A beautiful website doesn\'t help if guests can\'t find it. I optimize every resort site for local search — so when travelers search for "resorts in [your area]" or "beachfront villas [province]," your property appears near the top. This includes technical SEO, Google Business Profile optimization, and content structure that search engines understand.',
    details: [
      'Local SEO structure so your resort ranks for area-specific searches',
      'Google Business Profile setup and optimization',
      'Speed optimization — Google prioritizes fast-loading sites in search results',
      'Schema markup so your rooms, rates, and reviews appear in rich search results',
      'Ongoing recommendations to maintain and improve your search ranking',
    ],
    icon: 'Search',
  },
];

export const faqs: FaqItem[] = [
  {
    question: 'Why should my resort have a direct-booking website?',
    answer:
      'Every booking through Agoda, Booking.com, or Expedia costs you 15–25% in commissions. For a room at ₱5,000/night, that is ₱750–₱1,250 lost per booking. A direct-booking website eliminates that fee entirely. Beyond cost savings, you own the guest relationship — their email, preferences, and booking history — instead of the OTA owning it. Most resorts recover their website investment within the first year from just a few direct bookings.',
  },
  {
    question: 'Can guests pay online when they book?',
    answer:
      'Yes. Every booking system I build includes online payment integration. Guests can pay securely using GCash, PayMaya, credit cards, or bank transfers — whatever is most convenient for them. Payments are processed at the time of booking, which means guaranteed reservations and fewer no-shows. You receive the funds directly in your account, minus standard payment gateway fees.',
  },
  {
    question: 'How long does it take to build a resort website with a booking system?',
    answer:
      'A typical resort website with an online reservation system takes 6–10 weeks from kickoff to launch. The timeline is: planning and discovery (1 week), design (1–2 weeks), development (3–4 weeks), testing and revisions (1–2 weeks), and launch (1 week). Simpler brochure sites without booking functionality can be completed in 3–5 weeks. You will receive a detailed timeline in your project proposal before any work begins.',
  },
  {
    question: 'Can I update the website myself after it is built?',
    answer:
      'Yes. I build your site so you can make basic updates — room rates, promotions, photo changes — without needing to contact me every time. For larger changes or new features, I offer maintenance and support packages at a predictable monthly rate. You are never locked into a contract, and I am always available when you need help.',
  },
  {
    question: 'Do you work with resorts outside the Philippines?',
    answer:
      'Yes, I work with hospitality businesses worldwide. While I am based in the Philippines and specialize in serving local resorts and villas, I have built systems for international clients as well. All communication is in English, and I work on a flexible schedule to accommodate different time zones.',
  },
];
