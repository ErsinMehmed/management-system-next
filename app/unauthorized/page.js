"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dashboardLinks } from "@/data";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  const accessibleLinks = dashboardLinks.filter(
    (l) => role && l.role.includes(role)
  );

  return (
    <div className="min-h-screen bg-[#f3f7fd] flex items-center justify-center px-4">
      <div className="max-w-md w-full flex flex-col items-center gap-8">

        {/* SVG illustration */}
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Shield */}
              <path
                d="M40 6L12 18V38C12 54.4 24.4 69.6 40 74C55.6 69.6 68 54.4 68 38V18L40 6Z"
                fill="#EFF6FF"
                stroke="#BFDBFE"
                strokeWidth="2"
              />
              {/* Lock body */}
              <rect x="28" y="38" width="24" height="18" rx="3" fill="#0071f5" />
              {/* Lock shackle */}
              <path
                d="M32 38V32C32 27.6 36 24 40 24C44 24 48 27.6 48 32V38"
                stroke="#0071f5"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Keyhole */}
              <circle cx="40" cy="46" r="3" fill="white" />
              <rect x="38.5" y="48" width="3" height="4" rx="1" fill="white" />
            </svg>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="absolute -bottom-2 -left-4 w-6 h-6 rounded-full bg-blue-100 opacity-60" />
          <div className="absolute top-4 -left-6 w-4 h-4 rounded-full bg-indigo-100 opacity-50" />
        </div>

        {/* Text */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-800">Нямате достъп</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Тази страница не е достъпна за вашата роля.<br />
            Изберете страница, до която имате достъп.
          </p>
        </div>

        {/* Accessible links */}
        {accessibleLinks.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-1">
              Достъпни страници
            </p>
            {accessibleLinks.map((l) => (
              <Link
                key={l.link}
                href={l.link}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 hover:border-[#0071f5]/30 hover:shadow-md transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0 text-[#0071f5] group-hover:bg-[#0071f5] group-hover:text-white transition-colors">
                  {l.icon}
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#0071f5] transition-colors">
                  {l.text}
                </span>
                <svg className="ml-auto w-4 h-4 text-slate-300 group-hover:text-[#0071f5] transition-colors" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-400 hover:text-[#0071f5] transition-colors font-medium">
          ← Назад
        </button>

      </div>
    </div>
  );
}
