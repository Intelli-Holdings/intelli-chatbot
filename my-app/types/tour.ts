// types/tour.ts

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

export interface Step {
  icon: string;
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