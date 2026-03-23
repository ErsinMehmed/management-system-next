"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Link from "next/link";
import Input from "@/components/html/Input";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!name || !email || !password || !confirm) {
      setError("Попълнете всички полета.");
      return;
    }
    if (password !== confirm) {
      setError("Паролите не съвпадат.");
      return;
    }
    if (password.length < 8) {
      setError("Паролата трябва да е поне 8 символа.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="center-element min-h-screen w-full bg-[#f3f7fd]">
      <div className="center-element flex-col px-6 py-8 w-full sm:mx-auto lg:py-0">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-sm xl:p-0">
          <div className="p-6 space-y-5 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-gray-700">
              Създайте акаунт
            </h1>

            {success ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-semibold text-sm">Акаунтът е създаден успешно!</p>
                <p className="text-slate-400 text-xs mt-1">Пренасочване към вход...</p>
              </div>
            ) : (
              <>
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <Input
                  label="Имe и фамилия"
                  type="text"
                  onChange={(value) => setName(value)}
                  onEnterPress={handleSubmit}
                />

                <Input
                  label="Имейл"
                  type="email"
                  onChange={(value) => setEmail(value)}
                  onEnterPress={handleSubmit}
                />

                <Input
                  label="Парола"
                  type={showPass ? "text" : "password"}
                  onChange={(value) => setPassword(value)}
                  onEnterPress={handleSubmit}
                />

                <Input
                  label="Потвърди паролата"
                  type={showPass ? "text" : "password"}
                  onChange={(value) => setConfirm(value)}
                  onEnterPress={handleSubmit}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors -mt-2">
                  {showPass ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  {showPass ? "Скрий паролите" : "Покажи паролите"}
                </button>

                <Button
                  isDisabled={isLoading}
                  className="w-full font-semibold"
                  variant="primary"
                  onPress={handleSubmit}>
                  {isLoading ? "Зареждане..." : "Регистрация"}
                </Button>

                <p className="text-sm font-light text-gray-500 text-center">
                  Вече имате акаунт?{" "}
                  <Link href="/" className="text-blue-500 hover:underline font-medium">
                    Вход
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
