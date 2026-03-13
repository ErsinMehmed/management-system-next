"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { app, getMessaging, getToken, onMessage } from "@/libs/firebase-client";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function PushNotificationInit() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    const init = async () => {
      try {
        // Регистрираме Service Worker и му подаваме Firebase конфига
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        registration.active?.postMessage({
          type: "FIREBASE_CONFIG",
          config: firebaseConfig,
        });

        // Искаме разрешение за notifications
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const messaging = getMessaging(app);

        // Взимаме FCM token и го записваме в DB
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          await fetch("/api/notifications/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        }

        // Показва notification докато приложението е отворено (foreground)
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification ?? {};
          if (title) new Notification(title, { body });
        });
      } catch (error) {
        console.error("Push notification init error:", error);
      }
    };

    init();
  }, [session]);

  return null;
}
