export interface MdxFileMeta {
    slug: string;
    frontMatter: {
      title: string;
      description?: string;
      order?: number;
      [key: string]: any;
    };
  }
  
  export interface MdxFile extends MdxFileMeta {
    code?: string;
    frontmatter?: {
      [key: string]: any;
    };
  }