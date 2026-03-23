"use client";
import {RouterProvider, Toast} from "@heroui/react";
import {useRouter} from 'next/navigation'
import React from "react";

export default function Providers({children}) {
    const router = useRouter()

    return (
        <RouterProvider navigate={router.push}>
            <Toast.Provider placement="top" />
            {children}
        </RouterProvider>
    )
}
