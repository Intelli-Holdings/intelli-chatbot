"use client";

import React, { createContext, useContext, useState } from "react";

type NotificationsContextType = {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
};

const NotificationsContext = createContext<NotificationsContextType>({
  notificationCount: 0,
  setNotificationCount: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notificationCount, setNotificationCount] = useState(0);
  
  return (
    <NotificationsContext.Provider value={{ notificationCount, setNotificationCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);