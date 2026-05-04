"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const SOFIA_FALLBACK = { lat: 42.6977, lng: 23.3219 };

// Използваме Leaflet директно вместо react-leaflet, защото MapContainer-ът
// от 4.x хвърля "Map container is already initialized" при React 18 strict
// mode double-invoke (особено агресивно с Next.js 16 Turbopack). Чрез
// директен L.map() и map.remove() имаме пълен контрол над init/cleanup.
export default function RouteMap({ myCoords, destCoords, routeGeometry }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let map = null;

    (async () => {
      const Lmod = await import("leaflet");
      const L = Lmod.default || Lmod;
      if (cancelled || !containerRef.current) return;

      // Defensive cleanup ако предишен mount не е cleanup-нал контейнера
      if (containerRef.current._leaflet_id != null) {
        containerRef.current._leaflet_id = null;
      }

      const center = destCoords || myCoords || SOFIA_FALLBACK;

      map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const makeIcon = (color) =>
        L.divIcon({
          html: `<div style="width:22px;height:22px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>`,
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

      if (myCoords) {
        L.marker([myCoords.lat, myCoords.lng], { icon: makeIcon("#10b981") }).addTo(map);
      }
      if (destCoords) {
        L.marker([destCoords.lat, destCoords.lng], { icon: makeIcon("#ef4444") }).addTo(map);
      }

      if (routeGeometry && routeGeometry.length > 1) {
        L.polyline(routeGeometry, { color: "#0071f5", weight: 4, opacity: 0.85 }).addTo(map);
      } else if (myCoords && destCoords) {
        L.polyline(
          [
            [myCoords.lat, myCoords.lng],
            [destCoords.lat, destCoords.lng],
          ],
          { color: "#0071f5", weight: 3, opacity: 0.5, dashArray: "8 8" }
        ).addTo(map);
      }

      if (myCoords && destCoords) {
        map.fitBounds(
          [
            [myCoords.lat, myCoords.lng],
            [destCoords.lat, destCoords.lng],
          ],
          { padding: [40, 40] }
        );
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current._leaflet_id = null;
      }
    };
  }, [myCoords, destCoords, routeGeometry]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
