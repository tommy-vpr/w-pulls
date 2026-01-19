// components/ui/NeonAccordion.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Zap } from "lucide-react";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

interface NeonAccordionProps {
  items: AccordionItem[];
  /** Allow multiple items open at once */
  allowMultiple?: boolean;
  /** Accent color theme */
  accentColor?: "cyan" | "fuchsia" | "emerald" | "amber";
}

const COLORS = {
  cyan: {
    border: "border-cyan-400/30",
    borderHover: "hover:border-cyan-400/60",
    borderActive: "border-cyan-400/80",
    text: "text-cyan-400",
    textMuted: "text-cyan-400/60",
    glow: "rgba(0, 255, 255",
    bg: "from-cyan-400/10 to-cyan-400/5",
    indicator: "bg-cyan-400",
  },
  fuchsia: {
    border: "border-fuchsia-400/30",
    borderHover: "hover:border-fuchsia-400/60",
    borderActive: "border-fuchsia-400/80",
    text: "text-fuchsia-400",
    textMuted: "text-fuchsia-400/60",
    glow: "rgba(255, 0, 255",
    bg: "from-fuchsia-400/10 to-fuchsia-400/5",
    indicator: "bg-fuchsia-400",
  },
  emerald: {
    border: "border-emerald-400/30",
    borderHover: "hover:border-emerald-400/60",
    borderActive: "border-emerald-400/80",
    text: "text-emerald-400",
    textMuted: "text-emerald-400/60",
    glow: "rgba(16, 185, 129",
    bg: "from-emerald-400/10 to-emerald-400/5",
    indicator: "bg-emerald-400",
  },
  amber: {
    border: "border-amber-400/30",
    borderHover: "hover:border-amber-400/60",
    borderActive: "border-amber-400/80",
    text: "text-amber-400",
    textMuted: "text-amber-400/60",
    glow: "rgba(245, 158, 11",
    bg: "from-amber-400/10 to-amber-400/5",
    indicator: "bg-amber-400",
  },
};

export function NeonAccordion({
  items,
  allowMultiple = false,
  accentColor = "cyan",
}: NeonAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const colors = COLORS[accentColor];

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            {/* Glow effect when open */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-[1px] rounded-xl blur-sm pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${colors.glow}, 0.4), ${colors.glow}, 0.2))`,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Main accordion item */}
            <div
              className={`
                relative rounded-xl overflow-hidden transition-all duration-300
                border backdrop-blur-sm
                ${isOpen ? colors.borderActive : colors.border}
                ${!isOpen && colors.borderHover}
                bg-slate-950/80
              `}
              style={{
                boxShadow: isOpen
                  ? `0 0 20px ${colors.glow}, 0.2), inset 0 0 30px ${colors.glow}, 0.05)`
                  : "none",
              }}
            >
              {/* Question button */}
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left cursor-pointer"
              >
                {/* Index number / icon */}
                <div
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    border ${isOpen ? colors.borderActive : colors.border}
                    bg-gradient-to-br ${colors.bg}
                    transition-all duration-300
                  `}
                >
                  {item.icon || (
                    <span
                      className={`text-xs font-mono font-bold ${
                        isOpen ? colors.text : colors.textMuted
                      } transition-colors`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* Question text */}
                <span
                  className={`
                    flex-1 font-medium transition-colors duration-300
                    ${isOpen ? "text-white" : "text-cyan-100/80"}
                  `}
                >
                  {item.question}
                </span>

                {/* Chevron indicator */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                    border ${isOpen ? colors.borderActive : colors.border}
                    transition-all duration-300
                  `}
                >
                  <ChevronDown
                    className={`w-4 h-4 ${
                      isOpen ? colors.text : colors.textMuted
                    } transition-colors`}
                  />
                </motion.div>
              </button>

              {/* Answer panel */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {/* Top border line */}
                    <div
                      className="mx-5 h-px"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${colors.glow}, 0.5), transparent)`,
                      }}
                    />

                    {/* Answer content */}
                    <div className="px-5 py-4 pl-17">
                      <div className="pl-12">
                        <p className="text-cyan-100/60 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom accent line when open */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute bottom-0 left-0 right-0 h-[2px] ${colors.indicator}`}
                    style={{
                      boxShadow: `0 0 10px ${colors.glow}, 0.8)`,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
