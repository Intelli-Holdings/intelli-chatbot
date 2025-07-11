"use client";
import React, { useEffect, useRef, useState } from "react";

const AttentionBadge: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const originalTitle = useRef<string>("");

  useEffect(() => {
    setIsMounted(true);
    originalTitle.current = document.title;
  }, []);

  const setFaviconWithRedDot = (): void => {
    if (!isMounted) return;

    const img = new Image();
    img.src = "/Intelli.svg"; // Load original SVG

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the Intelli logo
      ctx.drawImage(img, 0, 0, 64, 64);

      // Draw red dot in top-right corner
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(54, 10, 6, 0, Math.PI * 2);
      ctx.fill();

      const faviconURL = canvas.toDataURL("image/png");

      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconURL;
    };
  };

  const resetFavicon = React.useCallback((): void => {
    if (!isMounted) return;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = "/Intelli.svg";
  }, [isMounted]);

  const pushNotification = (): void => {
    if (!isMounted) return;
    if (Notification.permission === "granted") {
      new Notification("New Message", {
        body: "You've got a new incoming message!",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("New Message", {
            body: "You've got a new incoming message!",
          });
        }
      });
    }
  };

  useEffect(() => {
    if (!isMounted) return;

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        setFaviconWithRedDot();
        pushNotification();
      } else {
        resetFavicon();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMounted, resetFavicon]);

  return null;
};

export default AttentionBadge;
