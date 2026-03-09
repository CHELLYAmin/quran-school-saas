"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void;
    initialLat?: number;
    initialLng?: number;
    initialAddress?: string;
}

function LocationMarker({ position, setPosition, setAddressName }: { position: [number, number] | null, setPosition: any, setAddressName: any }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            // Reverse geocoding with OpenStreetMap Nominatim
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18&addressdetails=1`)
                .then(res => res.json())
                .then(data => {
                    const addr = data.address;
                    // Format a nice readable address
                    const readable = [addr.house_number, addr.road, addr.city || addr.town || addr.village, addr.country]
                        .filter(Boolean).join(', ');
                    setAddressName(readable || data.display_name || "Adresse inconnue");
                })
                .catch(err => {
                    console.error("Error reverse geocoding:", err);
                    setAddressName("Erreur de récupération d'adresse");
                });
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMapEvents({});
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function MapPicker({ onLocationSelect, initialLat = 48.8566, initialLng = 2.3522, initialAddress = '' }: MapPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>([initialLat, initialLng]);
    const [addressName, setAddressName] = useState<string>(initialAddress);

    // Update internal state if the initial coordinates arrive late (e.g. from localStorage)
    useEffect(() => {
        setPosition([initialLat, initialLng]);
    }, [initialLat, initialLng]);

    useEffect(() => {
        if (initialAddress) {
            setAddressName(initialAddress);
        }
    }, [initialAddress]);

    // Trigger callback when position or address changes
    useEffect(() => {
        if (position && (position[0] !== initialLat || position[1] !== initialLng || addressName !== initialAddress)) {
            // Only fire callback if we actually changed something from the initialized state
            onLocationSelect(position[0], position[1], addressName);
        }
    }, [position, addressName]);

    return (
        <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-dark-200 dark:border-dark-700 relative z-10 shadow-inner">
            <MapContainer center={[initialLat, initialLng]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} attributionControl={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={[initialLat, initialLng]} />
                <LocationMarker position={position} setPosition={setPosition} setAddressName={setAddressName} />
            </MapContainer>
        </div>
    );
}
