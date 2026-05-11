"use client";
import { FiCheck, FiX } from "react-icons/fi";

// 4 правила = 4 точки скор. Bonus tier за дълга парола (12+ символа).
const RULES = [
  { test: (p) => p.length >= 8, label: "Поне 8 символа" },
  { test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p), label: "Главни и малки букви" },
  { test: (p) => /\d/.test(p), label: "Поне една цифра" },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: "Специален символ" },
];

const LEVELS = [
  { label: "Слаба", bar: "bg-rose-500", text: "text-rose-600" },
  { label: "Слаба", bar: "bg-rose-500", text: "text-rose-600" },
  { label: "Средна", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Силна", bar: "bg-lime-500", text: "text-lime-600" },
  { label: "Много силна", bar: "bg-emerald-500", text: "text-emerald-600" },
];

export default function PasswordStrengthMeter({ password = "" }) {
  if (!password) return null;

  const passed = RULES.map((r) => r.test(password));
  const baseScore = passed.filter(Boolean).length;
  // Bonus: парола 12+ + поне 3 правила = bumpва на най-горно ниво
  const score =
    password.length >= 12 && baseScore >= 3
      ? Math.min(4, baseScore + 1)
      : baseScore;

  const level = LEVELS[score];

  return (
    <div className="flex flex-col gap-2 -mt-1">
      {/* Animated bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => {
          const filled = i < score;
          return (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ease-out ${
                filled ? level.bar : "bg-slate-200"
              }`}
              style={{
                transitionDelay: filled ? `${i * 60}ms` : "0ms",
                transform: filled ? "scaleX(1)" : "scaleX(1)",
              }}
            />
          );
        })}
      </div>

      {/* Label + counter */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold transition-colors duration-300 ${level.text}`}>
          {level.label}
        </span>
        <span className="text-[10px] text-slate-400 tabular-nums">
          {password.length}{" "}
          {password.length === 1 ? "символ" : "символа"}
        </span>
      </div>

      {/* Requirement checklist */}
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1">
        {RULES.map((rule, i) => {
          const ok = passed[i];
          return (
            <li
              key={i}
              className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${
                ok ? "text-emerald-600" : "text-slate-400"
              }`}>
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  ok
                    ? "bg-emerald-100 scale-100 rotate-0"
                    : "bg-slate-100 scale-90 -rotate-90"
                }`}>
                {ok ? (
                  <FiCheck className="w-2.5 h-2.5" strokeWidth={3} />
                ) : (
                  <FiX className="w-2.5 h-2.5" strokeWidth={3} />
                )}
              </span>
              <span className="font-medium">{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
