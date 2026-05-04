"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { FiMapPin, FiNavigation, FiClock } from "react-icons/fi";

// Целият Leaflet компонент е dynamic като ЕДНА loadable — отделните dynamic-и
// на MapContainer / TileLayer и т.н. предизвикват "Map container is already
// initialized" в Next dev (StrictMode double mount).
const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => null,
});

// Haversine за fallback дистанция (когато OSRM е недостъпен)
const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
};

const formatDistance = (km) => {
  if (km == null) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

const formatDuration = (sec) => {
  if (sec == null) return "—";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} мин`;
  return `${Math.floor(min / 60)} ч ${min % 60} мин`;
};

export default function RouteMapModal({ isOpen, onOpenChange, order }) {
  const [myCoords, setMyCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [destError, setDestError] = useState(null);

  // Reset при затваряне
  useEffect(() => {
    if (!isOpen) {
      setMyCoords(null);
      setDestCoords(null);
      setRouteGeometry(null);
      setDistance(null);
      setDuration(null);
      setRouteError(null);
      setDestError(null);
    }
  }, [isOpen]);

  // Geolocation
  useEffect(() => {
    if (!isOpen) return;
    if (!navigator.geolocation) {
      setRouteError("Браузърът не поддържа geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setMyCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setRouteError("Не е разрешен достъп до местоположение."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 }
    );
  }, [isOpen]);

  // Geocoding на адреса (с DB кеш)
  useEffect(() => {
    if (!isOpen || !order?._id) return;
    if (order.coords?.lat != null && order.coords?.lng != null) {
      setDestCoords({ lat: order.coords.lat, lng: order.coords.lng });
      return;
    }
    fetch(`/api/client-orders/${order._id}/geocode`, { method: "POST" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok && data.coords) setDestCoords(data.coords);
        else setDestError(data?.message || "Адресът не е разпознат.");
      })
      .catch(() => setDestError("Грешка при локализиране на адреса."));
  }, [isOpen, order?._id, order?.coords?.lat, order?.coords?.lng]);

  // OSRM driving route
  useEffect(() => {
    if (!myCoords || !destCoords) return;
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${myCoords.lng},${myCoords.lat};${destCoords.lng},${destCoords.lat}` +
      `?overview=full&geometries=geojson`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data?.routes?.[0]) {
          const route = data.routes[0];
          setDistance(route.distance / 1000);
          setDuration(route.duration);
          setRouteGeometry(
            route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
          );
        } else {
          setDistance(haversineKm(myCoords, destCoords));
        }
      })
      .catch(() => setDistance(haversineKm(myCoords, destCoords)));
  }, [myCoords, destCoords]);

  const googleMapsUrl = (() => {
    const dest = encodeURIComponent(order?.address ?? "");
    if (myCoords) {
      return `https://www.google.com/maps/dir/?api=1&origin=${myCoords.lat},${myCoords.lng}&destination=${dest}&travelmode=driving`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
  })();

  // Loading states
  const isLocalizing =
    (!myCoords && !routeError) || (!destCoords && !destError);
  const isCalculatingRoute =
    myCoords != null && destCoords != null && distance == null;
  const cardsPending = !destError && !routeError && distance == null;

  const loadingLabel = (() => {
    if (!myCoords && !routeError) return "Локализирам твоето местоположение...";
    if (!destCoords && !destError) return "Локализирам адрес на клиента...";
    if (isCalculatingRoute) return "Изчислявам маршрут...";
    return null;
  })();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      placement="center"
      classNames={{ base: "mx-3 sm:mx-0" }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2.5 px-4 pb-2">
              <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
                <FiMapPin className="w-4.5 h-4.5 text-[#0071f5]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Маршрут до клиент</p>
                <p className="text-xs text-slate-400 font-normal">{order?.phone}</p>
              </div>
            </ModalHeader>

            <ModalBody className="px-4 gap-3">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <FiMapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="break-words">{order?.address || "Без адрес"}</p>
              </div>

              <div
                className="rounded-xl overflow-hidden border border-gray-100 relative bg-slate-50"
                style={{ height: "280px" }}
              >
                {/* Skeleton слой докато не приключи геолокацията/геокодирането */}
                {isLocalizing && (
                  <div className="absolute inset-0 bg-slate-100 animate-pulse" />
                )}

                {/* Картата се монтира след като поне един outcome е готов */}
                {!isLocalizing && isOpen && (
                  <RouteMap
                    myCoords={myCoords}
                    destCoords={destCoords}
                    routeGeometry={routeGeometry}
                  />
                )}

                {/* Loader: full-cover при initial localizing, по-дискретен badge при route calc */}
                {(isLocalizing || isCalculatingRoute) && loadingLabel && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div
                      className={
                        isCalculatingRoute
                          ? "flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full pl-3 pr-4 py-2 shadow-md border border-gray-100"
                          : "flex flex-col items-center gap-2"
                      }
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin shrink-0" />
                      <p className="text-xs text-slate-600 font-medium">{loadingLabel}</p>
                    </div>
                  </div>
                )}
              </div>

              {(routeError || destError) && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700 flex flex-col gap-1">
                  {routeError && <span>· {routeError}</span>}
                  {destError && <span>· {destError}</span>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 px-3.5 py-3 flex items-center gap-2.5">
                  <FiNavigation className="w-4 h-4 text-[#0071f5] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 font-medium">Разстояние</p>
                    {cardsPending ? (
                      <div className="h-5 w-20 bg-slate-200 rounded mt-1 animate-pulse" />
                    ) : (
                      <p className="text-base font-bold text-slate-700 tabular-nums">{formatDistance(distance)}</p>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-3.5 py-3 flex items-center gap-2.5">
                  <FiClock className="w-4 h-4 text-[#0071f5] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 font-medium">Време</p>
                    {cardsPending ? (
                      <div className="h-5 w-16 bg-slate-200 rounded mt-1 animate-pulse" />
                    ) : (
                      <p className="text-base font-bold text-slate-700 tabular-nums">{formatDuration(duration)}</p>
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>Затвори</Button>
              <Button
                color="primary"
                startContent={<FiNavigation className="w-4 h-4" />}
                onPress={() => window.open(googleMapsUrl, "_blank")}
              >
                Отвори в Google Maps
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
