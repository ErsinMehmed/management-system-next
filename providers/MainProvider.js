"use client";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { useRouter } from 'next/navigation'
import React from "react";

export default function Providers({ children }) {
    const router = useRouter()

    return (
        <HeroUIProvider navigate={router.push}>
            <ToastProvider placement="top" />
            {children}
        </HeroUIProvider>
    )
}
