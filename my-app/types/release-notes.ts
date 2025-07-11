export interface ReleaseNote {
    version: string;
    date: string;
    sections: {
      whatsNew: {
        overview: string;
        features: Array<{
          title: string;
          description: string;
          details?: string[];
        }>;
      };
      improvements: Array<{
        title: string;
        description: string;
      }>;
      technicalDetails: string[];
    };
  }