// Central mentor data source.
// Used by:
//   - src/components/OurTeam.astro   (home page cards)
//   - src/pages/team/*.astro         (individual profile pages)
//
// To add/edit a mentor, only this file needs to change.
//
// Fields wrapped in [Add ...] are placeholders — replace with the real
// text/assets when available. Nothing here has been invented; these are
// explicitly marked as not-yet-provided.

export interface Certificate {
  title: string;
  image: string | null; // path under /public, e.g. "/certificates/xyz.jpg"
}

export interface ProfessionalInfoItem {
  label: string;
  value: string;
}

export interface TeamMember {
  slug: string; // used in the route: /team/{slug}
  name: string;
  designation: string;
  tagline: string;
  photo: string; // path under /public
  initials: string; // fallback if photo is missing
  bio: string;
  professionalInfo: ProfessionalInfoItem[];
  certificates: Certificate[];
}

export const team: TeamMember[] = [
  {
    slug: "sabuj-faysal",
    name: "Md Sabuj Faysal",
    designation: "Founder, CEO & Lead Trading Mentor",
    tagline: "Helping traders succeed through verified education, market research, and real trading experience.",
    photo: "/team/sabuj-faysal.jpg",
    initials: "SF",
    bio: "Md Sabuj Faysal is the Founder, CEO, and Lead Trading Mentor of MEXO Trades with 7+ years of experience in the Forex and Futures markets. Specializing in market research, institutional analysis, and strategy development, he has worked with leading proprietary trading firms including TOPSTEP, LUCID TRADING, TRADEIFY, FTMO & FUNDING PIPS. Through MEXO Trades, he provides verified and tested trading education to help traders build consistency, discipline, and confidence.",
    professionalInfo: [
      { label: "Role at MEXO", value: "Founder, CEO & Lead Trading Mentor" },
      {
        label: "Area of Expertise",
        value:
          "Forex Trading • Futures Trading • Institutional Market Analysis • Market Research • Trading Strategy Development • Trading Psychology • Prop Firm Trading",
      },
      {
        label: "Trading / Market Experience",
        value:
          "7+ Years of Trading Experience • Forex & Futures Trader • Prop Firm Experience: TOPSTEP, LUCID TRADING, TRADEIFY, FTMO & FUNDING PIPS • Market Research & Strategy Development",
      },
      {
        label: "Education / Mentorship Focus",
        value:
          "Verified, tested trading education through structured mentorship, practical market analysis, and disciplined trading principles.",
      },
    ],
    certificates: [],
  },
  {
    slug: "faizur-rahman-shaikat",
    name: "Faizur Rahman Shaikat",
    designation: "Support Trading Mentor",
    tagline: "Supporting traders through practical guidance, market analysis, and continuous learning.",
    photo: "/team/faizur-rahman-shaikat.png",
    initials: "FS",
    bio: "Faizur Rahman Shaikat is a Support Trading Mentor at MEXO Trades, dedicated to helping traders strengthen their understanding of the Forex and Futures markets. He provides educational support through market analysis, mentorship sessions, and practical trading guidance. His goal is to simplify complex trading concepts and help students build confidence, discipline, and consistency throughout their trading journey.",
    professionalInfo: [
      { label: "Role at MEXO", value: "Support Trading Mentor" },
      {
        label: "Area of Expertise",
        value: "Forex Trading • Futures Trading • Market Analysis • Student Mentorship • Trading Psychology • Risk Management",
      },
      {
        label: "Trading / Market Experience",
        value: "Active Forex & Futures Trader • Practical Market Analysis • Student Mentorship • Trading Strategy Support",
      },
      {
        label: "Education / Mentorship Focus",
        value:
          "Helping students improve their trading skills through structured mentorship, market analysis, practical guidance, and continuous educational support.",
      },
    ],
    certificates: [],
  },
  {
    slug: "samsul-arefin",
    name: "Md Samsul Arefin",
    designation: "Support Trading Mentor",
    tagline: "Helping traders grow through practical education, market insights, and continuous support.",
    photo: "/team/md-samsul-arefin.jpg",
    initials: "SA",
    bio: "Md Samsul Arefin is a Support Trading Mentor at MEXO Trades, committed to assisting traders throughout their learning journey. He supports students by providing practical market analysis, educational guidance, and mentorship that helps traders develop confidence, discipline, and consistency in the financial markets.",
    professionalInfo: [
      { label: "Role at MEXO", value: "Support Trading Mentor" },
      {
        label: "Area of Expertise",
        value: "Forex Trading • Futures Trading • Market Analysis • Student Mentorship • Trading Education • Risk Management",
      },
      {
        label: "Trading / Market Experience",
        value: "Active Forex & Futures Trader • Practical Market Analysis • Student Mentorship • Trading Support",
      },
      {
        label: "Education / Mentorship Focus",
        value:
          "Providing practical trading education through structured mentorship, market analysis, and continuous guidance to help students become disciplined and consistent traders.",
      },
    ],
    certificates: [],
  },
];
