"use client";

import { useState, useEffect } from "react";
import { UserLocation } from "@/types";

interface GeolocationState {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: { lat: 21.0245, lng: 105.8412 }, // Default: Hanoi center
        error: "Trình duyệt không hỗ trợ định vị",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      () => {
        setState({
          location: { lat: 21.0245, lng: 105.8412 }, // Default: Hanoi center
          error: "Không thể lấy vị trí. Sử dụng vị trí mặc định.",
          loading: false,
        });
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  return state;
}
