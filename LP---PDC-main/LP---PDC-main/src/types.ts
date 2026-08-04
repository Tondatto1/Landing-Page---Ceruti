export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  category: 'revenda' | 'industria' | 'cooperativa' | 'consultoria';
  image: string;
  quote: string;
  metrics: string;
  rating: number;
  videoUrl?: string;
}

export interface VideoTestimonial {
  id: string;
  youtubeId: string;
  title: string;
  type: 'short' | 'full';
  category?: string;
}

export interface AgroSegment {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  description: string;
  challenges: string[];
  results: string[];
  image: string;
}

export interface TrustedCompany {
  name: string;
  category: string;
  logoText: string;
  highlight: string;
  logoUrl?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PlanConfig {
  companyType: string;
  teamSize: string;
  modality: string;
  primaryGoal: string;
}

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  role: string;
  teamSize: string;
  segment: string;
}
