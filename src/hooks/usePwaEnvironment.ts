"use client";

import { useEffect, useState } from "react";
import {
  isAndroidDevice,
  isIosDevice,
  isStandaloneDisplay,
} from "@/lib/pwa";

interface PwaEnvironment {
  ready: boolean;
  standalone: boolean;
  ios: boolean;
  android: boolean;
}

export function usePwaEnvironment(): PwaEnvironment {
  const [environment, setEnvironment] = useState<PwaEnvironment>({
    ready: false,
    standalone: false,
    ios: false,
    android: false,
  });

  useEffect(() => {
    setEnvironment({
      ready: true,
      standalone: isStandaloneDisplay(),
      ios: isIosDevice(),
      android: isAndroidDevice(),
    });
  }, []);

  return environment;
}
