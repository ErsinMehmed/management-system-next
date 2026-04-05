"use client";
import { RouterProvider, ToastProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Providers({ children }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <ToastProvider placement='top' />
      {children}
    </RouterProvider>
  );
}
