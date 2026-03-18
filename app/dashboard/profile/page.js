"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/react";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiCamera, FiUser, FiMail, FiShield } from "react-icons/fi";
import Layout from "@/components/layout/Dashboard";
import { addToast } from "@heroui/toast";

const CLOUDINARY_CLOUD = "dhp0zcdke";
const CLOUDINARY_PRESET = "ep0eopza";

// ─── PasswordField ───────────────────────────────────────────────────────────
const PasswordField = ({ label, value, onChange, show, onToggle, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
        {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

// ─── ProfilePage ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, update } = useSession();
  const fileRef = useRef(null);

  const [previewUrl, setPreviewUrl]   = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [current, setCurrent]         = useState("");
  const [next, setNext]               = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving]       = useState(false);

  const avatarSrc = previewUrl || session?.user?.profile_image;
  const initials  = session?.user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed");

      // Save to DB
      await fetch("/api/user/profile-image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_image: data.secure_url }),
      });

      // Update session
      await update({ profile_image: data.secure_url });
      setPreviewUrl(data.secure_url);

      addToast({ title: "Снимката е обновена", color: "success", timeout: 3000 });
    } catch {
      addToast({ title: "Грешка при качване", color: "danger", timeout: 3000 });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();

    if (next !== confirm) {
      addToast({ title: "Грешка", description: "Новите пароли не съвпадат.", color: "danger", timeout: 4000 });
      return;
    }
    if (next.length < 8) {
      addToast({ title: "Грешка", description: "Паролата трябва да е поне 8 символа.", color: "danger", timeout: 4000 });
      return;
    }

    setIsSaving(true);
    try {
      const res  = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ title: "Паролата е сменена", color: "success", timeout: 4000 });
        setCurrent(""); setNext(""); setConfirm("");
      } else {
        addToast({ title: "Грешка", description: data.message, color: "danger", timeout: 4000 });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout title="Моите данни">
      <div className="max-w-lg mx-auto flex flex-col gap-5">

        {/* ── Профил карта ── */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="h-16 bg-gradient-to-br from-[#0071f5] to-[#3b99ff] relative" />

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            {/* Avatar + role badge */}
            <div className="-mt-14 mb-4 flex items-end gap-3">
              <div className="relative group w-28 h-28 shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-blue-100 flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-[#0071f5]">{initials}</span>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {!isUploading && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <div className="flex flex-col items-center gap-1">
                      <FiCamera className="w-5 h-5 text-white" />
                      <span className="text-white text-[10px] font-semibold">Смяна</span>
                    </div>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071f5] bg-blue-50 px-2.5 py-1 rounded-full mb-1">
                <FiShield className="w-3 h-3" />
                {session?.user?.role}
              </span>
            </div>

            {/* Info редове */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
                <FiUser className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Пълно име</p>
                  <p className="text-sm font-semibold text-slate-700">{session?.user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
                <FiMail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Имейл</p>
                  <p className="text-sm font-semibold text-slate-700">{session?.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Смяна на парола ── */}
        <div className="bg-white rounded-3xl shadow-sm px-6 py-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiLock className="w-4 h-4 text-[#0071f5]" />
            </div>
            <span className="font-bold text-slate-700">Смяна на парола</span>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <PasswordField
              label="Текуща парола"
              value={current}
              onChange={setCurrent}
              show={showCurrent}
              onToggle={() => setShowCurrent(p => !p)}
              placeholder="••••••••"
            />

            <div className="h-px bg-slate-100 my-1" />

            <PasswordField
              label="Нова парола"
              value={next}
              onChange={setNext}
              show={showNext}
              onToggle={() => setShowNext(p => !p)}
              placeholder="Минимум 8 символа"
            />
            <PasswordField
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
              radius="xl"
              isLoading={isSaving}
              startContent={!isSaving && <FiCheck className="w-4 h-4" />}
              className="mt-2 font-semibold h-11">
              Запази паролата
            </Button>
          </form>
        </div>

      </div>
    </Layout>
  );
}
