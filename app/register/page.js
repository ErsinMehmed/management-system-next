"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@nextui-org/react";
import { authStore, commonStore } from "@/stores/useStore";
import Alert from "@/components/Alert";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";

const Register = () => {
  //   const { userData, roles, setUserData, createUserProfile, loadRoles } =
  //     authStore;
  //   const { errorFields, errorMessage, successMessage } = commonStore;
  //   const { data: session } = useSession();
  //   const router = useRouter();
  //   useEffect(() => {
  //     if (session) {
  //       router.push("/dashboard");
  //     }
  //     loadRoles();
  //   }, [session, router]);
  //   const handleFieldChange = (name, value) => {
  //     setUserData({ ...userData, [name]: value });
  //   };
  //   return (
  //     <>
  //       <Alert />
  //       <section className='center-element min-h-screen w-full bg-[#f3f7fd] py-10 2xl:py-0'>
  //         <div className='center-element flex-col px-6 py-8 w-full sm:mx-auto lg:py-0'>
  //           <div className='w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0'>
  //             <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
  //               <h1 className='text-xl font-bold leading-tight tracking-tight text-gray-800'>
  //                 Създайте акаунт
  //               </h1>
  //               <Input
  //                 type='text'
  //                 label='Име'
  //                 value={userData.name}
  //                 errorMessage={errorFields.name}
  //                 onChange={(value) => handleFieldChange("name", value)}
  //               />
  //               <Select
  //                 items={roles.roles}
  //                 label='Вие сте'
  //                 errorMessage={errorFields.role}
  //                 onChange={(value) => handleInputChange("role", value)}
  //               />
  //               <Input
  //                 type='email'
  //                 label='Имейл'
  //                 value={userData.email}
  //                 errorMessage={errorFields.email}
  //                 onChange={(value) => handleFieldChange("email", value)}
  //               />
  //               <Input
  //                 label='Парола'
  //                 type='password'
  //                 value={userData.password}
  //                 errorMessage={errorFields.password}
  //                 onChange={(value) => handleFieldChange("password", value)}
  //               />
  //               <Input
  //                 label='Потвърди парола'
  //                 type='password'
  //                 value={userData.passwordRep}
  //                 errorMessage={errorFields.passwordRep}
  //                 onChange={(value) => handleFieldChange("passwordRep", value)}
  //               />
  //               <Button
  //                 className='w-full'
  //                 color='primary'
  //                 onClick={createUserProfile}>
  //                 Регистрация
  //               </Button>
  //               <p className='text-sm font-light text-gray-500'>
  //                 Вече имате акаунт?{" "}
  //                 <Link
  //                   href='/'
  //                   className='hover:underline text-blue-500'>
  //                   Вход
  //                 </Link>
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </section>
  //     </>
  //   );
};

export default observer(Register);
