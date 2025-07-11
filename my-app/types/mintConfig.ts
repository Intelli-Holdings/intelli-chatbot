// types/mintConfig.ts

export interface NavLink {
    name: string;
    url: string;
    title?: string;
    page?: string;
  }
  
  export interface SidebarLink {
    group: string;
    pages: NavLink[];
    links?: NavLink[];
  }
  
  export interface MintConfig {
    name: string;
    logo: {
      dark: string;
      light: string;
    };
    favicon: string;
    colors: {
      primary: string;
      light: string;
      dark: string;
      anchors: {
        from: string;
        to: string;
      };
    };
    topbarLinks: NavLink[];
    topbarCtaButton: {
      name: string;
      url: string;
    };
    
    footerSocials: {
      [key: string]: string;
    };
    navigation: SidebarLink[];
  }