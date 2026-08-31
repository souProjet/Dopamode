'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icons';

export type QuestDestinationPayload = {
  label: string;
  lat: number | null;
  lon: number | null;
};

const QuestDestinationMapLeaflet = dynamic(
  () => import('./QuestDestinationMapLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center bg-[var(--surface)] text-xs font-medium text-[var(--muted)]"
        aria-hidden
      >
        Chargement de la carte…
      </div>
    ),
  },
);

async function fetchFootRoute(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  signal: AbortSignal,
): Promise<[number, number][] | null> {
  const url = `https://router.project-osrm.org/route/v1/foot/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    routes?: { geometry?: { coordinates?: [number, number][] } }[];
  };
  const coords = data.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  return coords.map(([lon, lat]) => [lat, lon] as [number, number]);
}

export default function QuestDestinationMap({
  destination,
  userPosition,
  /** Carte plus basse (ex. panneau détail mobile) pour ne pas saturer l'écran */
  compact = false,
}: {
  destination: QuestDestinationPayload;
  userPosition: { lat: number; lon: number } | null;
  compact?: boolean;
}) {
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeError, setRouteError] = useState(false);

  const dest = useMemo(() => {
    if (destination.lat != null && destination.lon != null) {
      return { lat: destination.lat, lon: destination.lon };
    }
    return null;
  }, [destination.lat, destination.lon]);

  useEffect(() => {
    if (!dest || !userPosition) {
      setRoute(null);
      setRouteError(false);
      return;
    }
    const ac = new AbortController();
    setRouteError(false);
    fetchFootRoute(userPosition, dest, ac.signal)
      .then((pts) => {
        if (!ac.signal.aborted) setRoute(pts);
      })
      .catch(() => {
        if (!ac.signal.aborted) setRouteError(true);
      });
    return () => ac.abort();
  }, [dest, userPosition]);

  const googleMapsHref = useMemo(() => {
    if (dest && userPosition) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userPosition.lat},${userPosition.lon}&destination=${dest.lat},${dest.lon}&travelmode=walking`;
    }
    if (dest) {
      return `https://www.google.com/maps/search/?api=1&query=${dest.lat},${dest.lon}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.label)}`;
  }, [dest, userPosition, destination.label]);

  const center = useMemo((): [number, number] => {
    if (dest) return [dest.lat, dest.lon];
    return [48.8566, 2.3522];
  }, [dest]);

  const positionsForFit = useMemo((): [number, number][] => {
    if (route && route.length > 1) return route;
    if (!dest) return [[48.8566, 2.3522]];
    const pts: [number, number][] = [[dest.lat, dest.lon]];
    if (userPosition) pts.push([userPosition.lat, userPosition.lon]);
    return pts;
  }, [route, dest, userPosition]);

  const mapInstanceKey = dest ? `${dest.lat}-${dest.lon}` : 'map';

  const labelTrim = destination.label.trim();
  const mapPopupLabel =
    !labelTrim ||
    /^null$/i.test(labelTrim) ||
    /^undefined$/i.test(labelTrim) ||
    /^lieu de la quête$/i.test(labelTrim)
      ? 'Point de rendez-vous'
      : destination.label;

  if (!dest) {
    return (
      <div className="rounded-[2px] border border-[var(--border-cyan)] bg-[var(--card)] p-4">
        <p className="flex items-start gap-2 text-sm font-semibold text-[var(--text)]">
          <Icon name="MapPin" size="sm" className="mt-0.5 shrink-0 text-[var(--violet)]" aria-hidden />
          <span>
            {!destination.label.trim() || /^null$/i.test(destination.label.trim())
              ? 'Lieu à préciser'
              : destination.label}
          </span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          Le lieu n'a pas pu être placé sur la carte. Ouvre Google Maps pour t'orienter.
        </p>
        <a
          href={googleMapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-md mt-4 w-full font-semibold"
        >
          Ouvrir dans Google Maps
        </a>
      </div>
    );
  }

  const mapFrameClass = compact
    ? 'h-[min(34vh,200px)] w-full min-h-[140px] sm:h-[200px]'
    : 'h-[min(58vw,300px)] w-full min-h-[220px] sm:h-[280px]';

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="overflow-hidden rounded-[2px] border border-[var(--border-cyan)] bg-[var(--card)]">
        <div className={mapFrameClass}>
          <QuestDestinationMapLeaflet
            key={mapInstanceKey}
            mapKey={mapInstanceKey}
            center={center}
            dest={dest}
            destinationLabel={mapPopupLabel}
            route={route}
            userPosition={userPosition}
            positionsForFit={positionsForFit}
          />
        </div>
      </div>

      <a
        href={googleMapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-md w-full font-semibold"
      >
        {userPosition ? 'Itinéraire dans Google Maps' : 'Voir dans Google Maps'}
      </a>

      {routeError ? (
        <p className="text-center text-xs text-[var(--gold)]">
          L'itinéraire à pied n'a pas pu être calculé. Utilise le lien ci-dessus.
        </p>
      ) : null}
    </div>
  );
}
