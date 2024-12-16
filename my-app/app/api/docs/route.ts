import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextApiRequest, NextApiResponse } from 'next';

interface DocFile {
  slug: string;
  frontMatter: {
    title: string;
    description?: string;
    order?: number;
  };
  content: string;
}

function getAllMdxFiles(dirPath: string): DocFile[] {
  const files = fs.readdirSync(dirPath);
  const mdxFiles: DocFile[] = [];

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      const subDirFiles = getAllMdxFiles(filePath);
      mdxFiles.push(...subDirFiles);
    } else if (file.endsWith('.mdx')) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      mdxFiles.push({
        slug: file.replace('.mdx', ''),
        frontMatter: {
          title: data.title || file.replace('.mdx', ''),
          description: data.description || '',
          order: data.order || 0,
        },
        content,
      });
    }
  });

  // Sort files by order
  return mdxFiles.sort((a, b) => (a.frontMatter.order || 0) - (b.frontMatter.order || 0));
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const docsDirectory = path.join(process.cwd(), 'app', 'docs');
  const mdxFiles = getAllMdxFiles(docsDirectory);
  res.status(200).json(mdxFiles);
}