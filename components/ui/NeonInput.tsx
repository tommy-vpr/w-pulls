// components/ui/NeonInput.tsx
"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  accentColor?: "cyan" | "fuchsia" | "emerald" | "amber";
}

interface NeonTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  accentColor?: "cyan" | "fuchsia" | "emerald" | "amber";
}

interface NeonSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  accentColor?: "cyan" | "fuchsia" | "emerald" | "amber";
}

const COLORS = {
  cyan: {
    border: "border-cyan-400/30",
    borderFocus: "focus-within:border-cyan-400/80",
    text: "text-cyan-400",
    textMuted: "text-cyan-400/50",
    glow: "rgba(0, 255, 255",
    ring: "focus-within:shadow-[0_0_15px_rgba(0,255,255,0.3)]",
  },
  fuchsia: {
    border: "border-fuchsia-400/30",
    borderFocus: "focus-within:border-fuchsia-400/80",
    text: "text-fuchsia-400",
    textMuted: "text-fuchsia-400/50",
    glow: "rgba(255, 0, 255",
    ring: "focus-within:shadow-[0_0_15px_rgba(255,0,255,0.3)]",
  },
  emerald: {
    border: "border-emerald-400/30",
    borderFocus: "focus-within:border-emerald-400/80",
    text: "text-emerald-400",
    textMuted: "text-emerald-400/50",
    glow: "rgba(16, 185, 129",
    ring: "focus-within:shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  },
  amber: {
    border: "border-amber-400/30",
    borderFocus: "focus-within:border-amber-400/80",
    text: "text-amber-400",
    textMuted: "text-amber-400/50",
    glow: "rgba(245, 158, 11",
    ring: "focus-within:shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  },
};

export function NeonInput({
  label,
  icon: Icon,
  accentColor = "cyan",
  className = "",
  ...props
}: NeonInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colors = COLORS[accentColor];

  return (
    <div className="space-y-2">
      <label
        className={`block text-[10px] uppercase tracking-widest ${colors.textMuted}`}
      >
        {label}
      </label>
      <div
        className={`
          relative rounded-lg overflow-hidden
          border ${colors.border} ${colors.borderFocus}
          bg-slate-900/50 backdrop-blur-sm
          transition-all duration-300
          ${colors.ring}
          ${className}
        `}
      >
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon
              className={`w-4 h-4 transition-colors duration-300 ${
                isFocused ? colors.text : colors.textMuted
              }`}
            />
          </div>
        )}

        {/* Input */}
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full bg-transparent px-4 py-3 text-sm text-white
            placeholder:text-cyan-100/30
            focus:outline-none
            ${Icon ? "pl-10" : ""}
          `}
        />

        {/* Bottom accent line on focus */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300
            ${isFocused ? "opacity-100" : "opacity-0"}
          `}
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.glow}, 0.8), transparent)`,
          }}
        />
      </div>
    </div>
  );
}

export function NeonTextarea({
  label,
  accentColor = "cyan",
  className = "",
  ...props
}: NeonTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colors = COLORS[accentColor];

  return (
    <div className="space-y-2">
      <label
        className={`block text-[10px] uppercase tracking-widest ${colors.textMuted}`}
      >
        {label}
      </label>
      <div
        className={`
          relative rounded-lg overflow-hidden
          border ${colors.border} ${colors.borderFocus}
          bg-slate-900/50 backdrop-blur-sm
          transition-all duration-300
          ${colors.ring}
          ${className}
        `}
      >
        {/* Textarea */}
        <textarea
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full bg-transparent px-4 py-3 text-sm text-white
            placeholder:text-cyan-100/30
            focus:outline-none
            resize-none
          `}
        />

        {/* Bottom accent line on focus */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300
            ${isFocused ? "opacity-100" : "opacity-0"}
          `}
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.glow}, 0.8), transparent)`,
          }}
        />
      </div>
    </div>
  );
}

export function NeonSelect({
  label,
  options,
  accentColor = "cyan",
  className = "",
  ...props
}: NeonSelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colors = COLORS[accentColor];

  return (
    <div className="space-y-2">
      <label
        className={`block text-[10px] uppercase tracking-widest ${colors.textMuted}`}
      >
        {label}
      </label>
      <div
        className={`
          relative rounded-lg overflow-hidden
          border ${colors.border} ${colors.borderFocus}
          bg-slate-900/50 backdrop-blur-sm
          transition-all duration-300
          ${colors.ring}
          ${className}
        `}
      >
        {/* Select */}
        <select
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full bg-transparent px-4 py-3 text-sm text-white
            focus:outline-none
            appearance-none cursor-pointer
            [&>option]:bg-slate-900 [&>option]:text-white
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 transition-colors duration-300 ${
              isFocused ? colors.text : colors.textMuted
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Bottom accent line on focus */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300
            ${isFocused ? "opacity-100" : "opacity-0"}
          `}
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.glow}, 0.8), transparent)`,
          }}
        />
      </div>
    </div>
  );
}
