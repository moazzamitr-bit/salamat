import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toPersianDigits } from '@/lib/utils'
import { CENTER_CATEGORY_LABELS } from '@/lib/constants'
import type { HealthCenter } from '@/types'

interface CenterWithDistance extends HealthCenter {
  distanceKm: number
}

interface CentersMapProps {
  centers: CenterWithDistance[]
  selectedId: string | null
  onSelect: (id: string) => void
  userLocation: { latitude: number; longitude: number }
}

function makeCenterIcon(isEmergency: boolean, isSelected: boolean): L.DivIcon {
  const bg = isEmergency ? 'hsl(0 62% 46%)' : 'hsl(174 42% 36%)'
  const size = isSelected ? 38 : 30
  const ring = isSelected ? 'box-shadow: 0 0 0 3px white, 0 0 0 6px hsl(199 72% 28%);' : ''
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);background:${bg};border:2.5px solid white;
      box-shadow:0 2px 6px rgb(15 41 66 / 0.35);${ring}
      display:flex;align-items:center;justify-content:center;">
      <div style="transform:rotate(45deg);width:${size * 0.4}px;height:${size * 0.4}px;border-radius:50%;background:white;"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:hsl(199 72% 28%);border:3px solid white;
    box-shadow:0 0 0 4px hsl(199 72% 28% / 0.25), 0 2px 6px rgb(15 41 66 / 0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

/** Pans map when the selected center changes, and refits bounds when the list changes. */
function MapController({
  centers,
  selectedId,
}: {
  centers: CenterWithDistance[]
  selectedId: string | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedId) {
      const c = centers.find((x) => x.id === selectedId)
      if (c) {
        map.flyTo([c.latitude, c.longitude], Math.max(map.getZoom(), 14), { duration: 0.6 })
      }
    }
  }, [selectedId, centers, map])

  useEffect(() => {
    if (!selectedId && centers.length > 0) {
      const bounds = L.latLngBounds(centers.map((c) => [c.latitude, c.longitude]))
      map.fitBounds(bounds.pad(0.15), { maxZoom: 14 })
    }
  }, [centers, selectedId, map])

  return null
}

export function CentersMap({ centers, selectedId, onSelect, userLocation }: CentersMapProps) {
  return (
    <MapContainer
      center={[userLocation.latitude, userLocation.longitude]}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController centers={centers} selectedId={selectedId} />

      <Marker
        position={[userLocation.latitude, userLocation.longitude]}
        icon={userIcon}
        zIndexOffset={500}
      >
        <Popup>
          <div dir="rtl" style={{ fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}>
            موقعیت شما — تهران (نمایشی)
          </div>
        </Popup>
      </Marker>

      {centers.map((center) => (
        <Marker
          key={center.id}
          position={[center.latitude, center.longitude]}
          icon={makeCenterIcon(!!center.isEmergency, center.id === selectedId)}
          zIndexOffset={center.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(center.id) }}
        >
          <Popup>
            <div
              dir="rtl"
              style={{
                fontFamily: 'Vazirmatn, Tahoma, sans-serif',
                textAlign: 'right',
                minWidth: '11rem',
              }}
            >
              <p style={{ fontWeight: 600, margin: 0 }}>{center.name}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#5a6b7d' }}>
                {CENTER_CATEGORY_LABELS[center.category]} ·{' '}
                {toPersianDigits(center.distanceKm.toFixed(1))} کیلومتر
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default CentersMap
