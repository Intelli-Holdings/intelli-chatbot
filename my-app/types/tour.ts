// types/tour.ts
import { ReactNode } from 'react';

export type SidePosition = 
  | "bottom" 
  | "top" 
  | "right" 
  | "left" 
  | "top-left" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-right" 
  | "left-top" 
  | "left-bottom" 
  | "right-top" 
  | "right-bottom";


  interface Step {
    icon: ReactNode;  // Changed to ComponentType
    title: string;  
    content: string;  
    selector: string;  
    side: SidePosition;  
    showControls: boolean;  
    showSkip: boolean;  
  }
  

export interface Tour {
  tour: string;
  steps: Step[];
}

export type Tours = Tour[];