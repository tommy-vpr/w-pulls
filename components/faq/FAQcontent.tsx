// components/faq/FAQContent.tsx
"use client";

import { useState } from "react";
import { NeonAccordion } from "@/components/ui/NeonAccordion";
import {
  HelpCircle,
  CreditCard,
  Package,
  Shield,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
  },
  {
    id: "packs",
    label: "Packs & Cards",
    icon: Package,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    id: "account",
    label: "Account",
    icon: Shield,
  },
];

const FAQ_DATA = {
  general: [
    {
      id: "g1",
      question: "What is W-Pull?",
      answer:
        "W-Pull is a digital trading card platform where you can purchase mystery packs containing rare and collectible cards. Each pack uses our advanced probability matrix system to deliver a unique unboxing experience with stunning holographic effects.",
    },
    {
      id: "g2",
      question: "How does the card reveal system work?",
      answer:
        "When you purchase a pack, you'll be taken to our immersive 3D reveal experience. Click or tap to open your pack and watch as each card is revealed with real-time holographic animations. The rarity of each card is determined at the moment of purchase using our cryptographically secure random number generator.",
    },
    {
      id: "g3",
      question: "Are the cards physical or digital?",
      answer:
        "Currently, all cards on W-Pull are digital collectibles. Each card is stored in your account and can be viewed in your collection at any time. We're exploring options for physical card fulfillment in future updates.",
    },
    {
      id: "g4",
      question: "Can I trade cards with other users?",
      answer:
        "Trading functionality is on our roadmap and will be available in a future update. Stay tuned to our changelog for announcements about new features including our peer-to-peer trading marketplace.",
    },
  ],
  packs: [
    {
      id: "p1",
      question: "What are the different pack tiers?",
      answer:
        "We offer four pack tiers: Standard, Premium, Ultra, and Master. Each tier has different probability matrices affecting your chances of pulling rare, epic, and legendary cards. Higher tiers offer better odds for rare pulls and may contain exclusive cards not available in lower tiers.",
    },
    {
      id: "p2",
      question: "What determines card rarity?",
      answer:
        "Card rarity is determined by our probability matrix system at the moment of purchase. Rarities include Common, Uncommon, Rare, Epic, Legendary, and the ultra-rare Mythic tier. Each pack tier has published odds that you can view before purchasing.",
    },
    {
      id: "p3",
      question: "Can I get duplicate cards?",
      answer:
        "Yes, duplicates are possible. Each pack pull is independent and random. In the future, we plan to introduce a duplicate protection system and a way to exchange duplicates for store credit or other rewards.",
    },
    {
      id: "p4",
      question: "How many cards are in each pack?",
      answer:
        "Standard packs contain 5 cards, Premium packs contain 7 cards, Ultra packs contain 10 cards, and Master packs contain 12 cards with at least one guaranteed Rare or higher.",
    },
    {
      id: "p5",
      question: "Are pack contents predetermined?",
      answer:
        "No. Pack contents are determined at the exact moment of purchase using a cryptographically secure random number generator. This ensures fair and transparent odds for all users.",
    },
  ],
  payments: [
    {
      id: "pay1",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor. We're working on adding additional payment methods including PayPal and cryptocurrency in future updates.",
    },
    {
      id: "pay2",
      question: "Is my payment information secure?",
      answer:
        "Absolutely. We use Stripe for all payment processing, which is PCI DSS Level 1 certified—the highest level of security certification. We never store your full card details on our servers.",
    },
    {
      id: "pay3",
      question: "Can I get a refund?",
      answer:
        "Due to the digital nature of our products and the instant reveal system, all sales are final. Once a pack is purchased, the cards are immediately generated and added to your collection. Please review pack contents and odds carefully before purchasing.",
    },
    {
      id: "pay4",
      question: "Do you charge sales tax?",
      answer:
        "Yes, applicable sales tax is calculated automatically based on your location and added at checkout. Tax rates vary by state and jurisdiction in compliance with local regulations.",
    },
  ],
  account: [
    {
      id: "a1",
      question: "How do I create an account?",
      answer:
        "Click the 'Get Started' button in the navigation bar. You can sign up using your email address or through Google/Discord OAuth. Account creation is free and only takes a few seconds.",
    },
    {
      id: "a2",
      question: "How do I view my card collection?",
      answer:
        "Once logged in, navigate to your Dashboard and click on 'Collection'. Here you can view all your cards, filter by rarity, search by name, and see detailed stats about your collection progress.",
    },
    {
      id: "a3",
      question: "Can I delete my account?",
      answer:
        "Yes, you can request account deletion from your Settings page. Please note that account deletion is permanent and will result in the loss of all cards and purchase history. This action cannot be undone.",
    },
    {
      id: "a4",
      question: "I forgot my password. How do I reset it?",
      answer:
        "Click 'Sign In' then 'Forgot Password'. Enter your email address and we'll send you a secure link to reset your password. The link expires after 24 hours for security purposes.",
    },
  ],
};

export function FAQContent() {
  const [activeCategory, setActiveCategory] = useState("general");

  return (
    <div className="min-h-screen mt-12 pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase tracking-widest text-cyan-400">
              Support Center
            </span>
          </div> */}

          <h1
            className="font-orbitron text-4xl md:text-5xl font-bold text-cyan-400 mb-4"
            style={{
              textShadow: `
                0 0 10px rgba(0, 255, 255, 0.7),
                0 0 20px rgba(0, 255, 255, 0.5),
                0 0 40px rgba(0, 255, 255, 0.3)
              `,
            }}
          >
            FAQ
          </h1>

          <p className="text-cyan-100/60 max-w-xl mx-auto">
            Find answers to commonly asked questions about W-Pull, our card
            system, and how everything works.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FAQ_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  relative px-5 py-2.5 rounded-lg font-medium text-sm uppercase tracking-wider
                  transition-all duration-300 cursor-pointer
                  flex items-center gap-2
                  ${
                    isActive
                      ? "text-white bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/10 border-cyan-400/60 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                      : "text-cyan-100/60 hover:text-cyan-100 border-cyan-400/20 hover:border-cyan-400/40"
                  }
                  border backdrop-blur-sm
                `}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-cyan-400" : "text-cyan-400/50"
                  }`}
                />
                {category.label}

                {/* Active indicator */}
                {isActive && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div className="relative">
          {/* Decorative side lines */}
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
          <div className="absolute -right-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />

          <NeonAccordion
            items={FAQ_DATA[activeCategory as keyof typeof FAQ_DATA]}
            accentColor="cyan"
          />
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div
            className="relative inline-block rounded-xl overflow-hidden p-px"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,255,255,0.5), rgba(255,0,255,0.3), rgba(0,255,255,0.5))",
            }}
          >
            <div className="relative rounded-xl bg-slate-950/90 px-8 py-6 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <RefreshCw className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron text-lg text-white">
                  Still have questions?
                </h3>
              </div>
              <p className="text-cyan-100/60 text-sm mb-4">
                Can&apos;t find what you&apos;re looking for? Our support team
                is here to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
