"use client";
import {HeroUIProvider} from "@heroui/react";
import {ToastProvider} from "@heroui/toast";
import {useRouter} from 'next/navigation'

export default function Providers({children}) {
    const router = useRouter()

    return (
        <HeroUIProvider navigate={router.push}>
            <ToastProvider placement="top-center" toastOffset={25}/>
            {children}
        </HeroUIProvider>
    )
}
