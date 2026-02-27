"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

interface GeolocationState {
    coords: {
        latitude: number;
        longitude: number;
    } | null;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({
        coords: null,
        accuracy: null,
        error: null,
        loading: false,
    });

    const watchId = useRef<number | null>(null);

    const stopTracking = useCallback(() => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
    }, []);

    const getPosition = useCallback((options?: PositionOptions, continuous: boolean = false, onSuccess?: (coords: { latitude: number; longitude: number }, accuracy: number) => void) => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: "Geolocation not supported" }));
            return;
        }

        stopTracking();
        setState(prev => ({ ...prev, loading: true, error: null }));

        const defaultOptions: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0,
            ...options
        };

        const successHandler = (position: GeolocationPosition) => {
            const newCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
            setState({
                coords: newCoords,
                accuracy: position.coords.accuracy,
                error: null,
                loading: false,
            });
            onSuccess?.(newCoords, position.coords.accuracy);
        };

        const errorHandler = (error: GeolocationPositionError) => {
            let msg = "Failed to get location";
            if (error.code === 1) msg = "Permission denied. Please enable location access.";
            if (error.code === 2) msg = "Position unavailable. Please turn on your GPS.";
            if (error.code === 3) msg = "Request timed out. Please try again near a window.";

            setState(prev => ({
                ...prev,
                error: msg,
                loading: false
            }));
            stopTracking();
        };

        if (continuous) {
            watchId.current = navigator.geolocation.watchPosition(successHandler, errorHandler, defaultOptions);
        } else {
            navigator.geolocation.getCurrentPosition(successHandler, errorHandler, defaultOptions);
        }
    }, [stopTracking]);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    useEffect(() => {
        return () => stopTracking();
    }, [stopTracking]);

    return { ...state, getPosition, stopTracking, clearError };
};
