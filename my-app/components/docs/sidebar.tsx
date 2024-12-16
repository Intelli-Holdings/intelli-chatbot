import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { mintConfig } from '@/lib/mint-config';
import { MintConfig, SidebarLink, NavLink } from '@/types/mintConfig';

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

export default async function Sidebar({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const docsDirectory = path.join(process.cwd(), 'app', 'docs');
  const mdxFiles = getAllMdxFiles(docsDirectory);

  // Start with introduction.mdx or first page
  const currentPage = searchParams.page || 'introduction';
  const currentDoc = mdxFiles.find(doc => doc.slug.toLowerCase() === currentPage.toLowerCase());

  // Get next and previous docs
  const currentIndex = mdxFiles.findIndex(doc => doc.slug.toLowerCase() === currentPage.toLowerCase());
  const prevDoc = currentIndex > 0 ? mdxFiles[currentIndex - 1] : null;
  const nextDoc = currentIndex < mdxFiles.length - 1 ? mdxFiles[currentIndex + 1] : null;

  if (!currentDoc) {
    return <div>Document not found</div>;
  }

  const config: MintConfig = mintConfig;

  return (
    <div className="bg-white border-r border-shadow-sm border-gray-150 p-12 sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-8">
        {config.navigation.map((link: SidebarLink, index: number) => (
          <div key={index}>
            <h3 className="text-gray-500 font-medium text-sm uppercase mb-4">
              {link.group}
            </h3>
            <nav>
              {mdxFiles.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs?page=${doc.slug}`}
                  className={`
                    block py-2 
                    ${currentDoc.slug === doc.slug
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300'}
                    hover:text-blue-600 dark:hover:text-blue-400 
                    transition-colors
                  `}
                >
                  {doc.frontMatter.title}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}