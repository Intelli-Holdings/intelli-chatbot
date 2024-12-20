// Frontend Widget Types (camelCase)
export interface Widget {
  id: string;
  organization: string;
  assistantId: string;
  websiteUrl: string;
  widgetName: string;
  colorPrimaryColor: string;
  colorBubbleBackground: string;
  colorUserBubbleColor: string;
  colorUserBubbleTextColor: string;
  colorTextColor: string;
  colorHeaderBackground: string;
  stylingBorderRadius: number;
  stylingBubbleShape: 'square' | 'rounded';
  stylingPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  stylingWidth: number;
  avatarUrl: string;
  avatarShape: 'square' | 'rounded' | 'circle';
  enableMarkdown: boolean;
  enableCodeHighlighting: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWidgetData {
  organizationId: string;
  assistantId: string;
  websiteUrl: string;
  widgetName: string;
  colorPrimaryColor: string;
  colorBubbleBackground: string;
  colorUserBubbleColor: string;
  colorUserBubbleTextColor: string;
  colorTextColor: string;
  colorHeaderBackground: string;
  stylingBorderRadius: number;
  stylingBubbleShape: 'square' | 'rounded';
  stylingPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  stylingWidth: number;
  avatarUrl: string;
  avatarShape: 'square' | 'rounded' | 'circle';
  enableMarkdown: boolean;
  enableCodeHighlighting: boolean;
}

// Utility function to convert camelCase to snake_case
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Utility function to convert snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Convert frontend data to backend format
export function convertToBackendFormat(frontendData: CreateWidgetData): any {
  const backendData: any = {};
  
  for (const [key, value] of Object.entries(frontendData)) {
    backendData[toSnakeCase(key)] = value;
  }
  
  return backendData;
}

// Convert backend response to frontend format
export function convertToFrontendFormat(backendData: any): Widget {
  const frontendData: any = {};
  
  for (const [key, value] of Object.entries(backendData)) {
    frontendData[toCamelCase(key)] = value;
  }
  
  return frontendData as Widget;
}