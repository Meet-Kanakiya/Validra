import { NavLink } from "@/types/landing";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_SECTIONS = [
  {
    title: "Platform",
    links: [
      { label: "Home", href: "/" },
      { label: "Features", href: "/features" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Inspector Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Legal Metrology",
    links: [
      { label: "Act & Rules 2011", href: "/faq" },
      { label: "Rule 6 Declarations", href: "/features" },
      { label: "Evidence & Section 65B", href: "/about" },
      { label: "Compliance Standards", href: "/faq" },
    ],
  },
  {
    title: "Organization",
    links: [
      { label: "About VisionMinds", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "GitHub Repository", href: "https://github.com/dhruvpatel16120/Validra" },
    ],
  },
];
