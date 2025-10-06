"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@heroui/react";
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
  }, [session]);

  const handleFieldChange = (name, value) => {
    setLoginData({ ...loginData, [name]: value });
  };

  return (
    <>
      <LinearLoader show={isLoading} />

      <Alert />

      <section
        className={`center-element min-h-screen w-full bg-[#f3f7fd] ${
          isLoading && "animate-pulse pointer-events-none"
        }`}>
        <div className='center-element flex-col px-6 py-8 w-full sm:mx-auto lg:py-0'>
          <div className='w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-sm xl:p-0'>
            <div className='p-6 space-y-5 md:space-y-6 sm:p-8'>
              <h1 className='text-xl font-semibold leading-tight tracking-tight text-gray-800'>
                Влезте в акаунта си
              </h1>

              <Input
                type='email'
                label='Имейл'
                errorMessage={errorFields.error}
                onChange={(value) => handleFieldChange("email", value)}
                onEnterPress={login}
              />

              <Input
                label='Парола'
                type='password'
                errorMessage={errorFields.error}
                onChange={(value) => handleFieldChange("password", value)}
                onEnterPress={login}
              />

              <Button
                isDisabled={isLoading}
                className='w-full font-semibold'
                color='primary'
                onClick={login}>
                Вход
              </Button>

              {/* <p className='text-sm font-light text-gray-500'>
                Нямате профил все още?{" "}
                <Link
                  className='ml-1 hover:underline text-blue-500'
                  href='/'>
                  Регистрация
                </Link>
              </p> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default observer(Login);
