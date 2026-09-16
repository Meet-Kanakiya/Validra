export interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  metrics: {
    label: string;
    value: string;
    status?: "pass" | "warn" | "fail" | "neutral";
  }[];
}

export interface ProblemItem {
  id: string;
  title: string;
  stat: string;
  description: string;
  impact: string;
  ruleRef: string;
}

export interface SolutionPillar {
  title: string;
  tagline: string;
  description: string;
  badge: string;
  metric: string;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge: string;
  legalRef?: string;
}

export interface StepItem {
  stepNumber: number;
  title: string;
  badge: string;
  description: string;
  icon: string;
  detail: string;
}

export interface TechItem {
  name: string;
  category: "Frontend" | "Backend" | "AI & Vision" | "Rule Engine" | "Database & Storage";
  description: string;
  badge: string;
  highlight: string;
}

export interface TeamMember {
  name: string;
  role: string;
  domain: string;
  bio: string;
  avatar: string;
  github?: string;
  linkedin?: string;
}

export interface FAQItem {
  id: string;
  category: "Legal Metrology" | "Technology & AI" | "Inspection Process" | "Enforcement & Reports";
  question: string;
  answer: string;
  legalRef?: string;
}
