"use client";
import React, { useEffect, useRef } from "react";

const AttentionBadge: React.FC = () => {
  // Save the original title
  const originalTitle = useRef<string>(document.title);
  // The interval ID returned by setInterval (a number in browsers)
  const blinkInterval = useRef<number | null>(null);
  // Boolean to toggle title changes
  const titleToggle = useRef<boolean>(false);

  // Dynamically generate a favicon from an emoji
  const setFaviconEmoji = (emoji: string): void => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 64, 64);
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 32, 32);
    const faviconURL = canvas.toDataURL("image/png");
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconURL;
  };

  // Reset favicon to a default emoji (change as needed)
  const resetFavicon = React.useCallback((): void => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      document.head.appendChild(newLink);
      newLink.href = "/Intelli.svg";
    } else {
      link.href = "/Intelli.svg";
    }
  }, []); 

  // Request and show a browser notification (if permitted)
  const pushNotification = (): void => {
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

  // Start blinking the tab title
  const startBlinkingTitle = (): void => {
    if (blinkInterval.current !== null) return;
    blinkInterval.current = window.setInterval(() => {
      document.title = titleToggle.current
        ? originalTitle.current
        : "📩 Come Back!";
      titleToggle.current = !titleToggle.current;
    }, 1000);
  };

  // Stop blinking the title and reset it
  const stopBlinkingTitle = (): void => {
    if (blinkInterval.current !== null) {
      clearInterval(blinkInterval.current);
      blinkInterval.current = null;
    }
    document.title = originalTitle.current;
  };

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        setFaviconEmoji("🔴"); // red dot badge
        startBlinkingTitle();
        pushNotification();
      } else {
        stopBlinkingTitle();
        resetFavicon();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (blinkInterval.current !== null) {
        clearInterval(blinkInterval.current);
      }
    };
  }, [resetFavicon]);

  return null; // This component renders no UI
};

export default AttentionBadge;
