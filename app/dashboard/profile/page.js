"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/react";
import { FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import Layout from "@/components/layout/Dashboard";
import { addToast } from "@heroui/toast";

const Field = ({ label, value, onChange, show, onToggle, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

export default function ProfilePage() {
  const { data: session } = useSession();

  const [current, setCurrent]       = useState("");
  const [next, setNext]             = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (next !== confirm) {
      addToast({ title: "Грешка", description: "Новите пароли не съвпадат.", color: "danger", timeout: 4000 });
      return;
    }
    if (next.length < 8) {
      addToast({ title: "Грешка", description: "Паролата трябва да е поне 8 символа.", color: "danger", timeout: 4000 });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ title: "Готово", description: data.message, color: "success", timeout: 4000 });
        setCurrent(""); setNext(""); setConfirm("");
      } else {
        addToast({ title: "Грешка", description: data.message, color: "danger", timeout: 4000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Моите данни">
      <div className="max-w-md mx-auto flex flex-col gap-4">

        {/* Профил карта */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-[#0071f5]">
              {session?.user?.name?.charAt(0) ?? "?"}
            </span>
          </div>
          <div>
            <p className="font-bold text-slate-800">{session?.user?.name}</p>
            <p className="text-sm text-slate-400">{session?.user?.email}</p>
            <span className="text-xs font-semibold text-[#0071f5] bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              {session?.user?.role}
            </span>
          </div>
        </div>

        {/* Смяна на парола */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <FiLock className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700 text-sm">Смяна на парола</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field
              label="Текуща парола"
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              onToggle={() => setShowCurrent(p => !p)}
              placeholder="••••••••"
            />
            <Field
              label="Нова парола"
              value={next}
              onChange={setNext}
              show={showNext}
              onToggle={() => setShowNext(p => !p)}
              placeholder="Минимум 8 символа"
            />
            <Field
              label="Потвърди новата парола"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              onToggle={() => setShowConfirm(p => !p)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              color="primary"
              radius="lg"
              isLoading={isLoading}
              startContent={!isLoading && <FiCheck className="w-4 h-4" />}
              className="mt-1 font-semibold">
              Запази
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
