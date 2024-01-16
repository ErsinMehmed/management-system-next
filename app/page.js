"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { Button, Checkbox } from "@nextui-org/react";
import { authStore, commonStore } from "@/stores/useStore";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Alert from "@/components/Alert";
import Input from "@/components/html/Input";
import LinearLoader from "@/components/LinearLoader";

const Login = () => {
  const { loginData, setLoginData, login } = authStore;
  const { errorFields, errorMessage, isLoading } = commonStore;
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleFieldChange = (name, value) => {
    setLoginData({ ...loginData, [name]: value });
  };

  return (
    <>
      <LinearLoader show={isLoading} />

      <Alert />

      <section
        className={`flex items-center justify-center min-h-screen w-full bg-[#f3f7fd] ${
          isLoading && "animate-pulse pointer-events-none"
        }`}
      >
        <div className="flex flex-col px-6 py-8 sm:mx-auto lg:py-0">
          <div className="w-full bg-white rounded-lg shadow md:mt-0 xl:p-0">
            <div className="p-6 space-y-5 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-800">
                Влезте в акаунта си
              </h1>

              <Input
                type="email"
                label="Имейл"
                errorMessage={errorFields.error}
                onChange={(value) => handleFieldChange("email", value)}
              />

              <Input
                label="Парола"
                type={"password"}
                errorMessage={errorFields.error}
                onChange={(value) => handleFieldChange("password", value)}
              />

              <div className="flex items-center justify-between space-x-10 sm:space-x-28">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Checkbox size="sm">Запомни ме</Checkbox>
                  </div>
                </div>

                <Link
                  href="#"
                  className="hover:underline text-blue-600 text-sm"
                >
                  Забравена парола
                </Link>
              </div>

              <Button className="w-full" color="primary" onClick={login}>
                Вход
              </Button>

              <p className="text-sm font-light text-gray-500">
                Нямате профил все още?{" "}
                <Link className="ml-1 hover:underline text-blue-500" href="/">
                  Регистрация
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default observer(Login);
