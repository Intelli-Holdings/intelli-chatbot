import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from './mdx-components';
import Link from 'next/link';

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

export default async function DocsPage({
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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
        <article className="mb-16 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Page Header */}
          <header className="bg-gray-100 dark:bg-gray-700 p-6 border-b border-gray-200 dark:border-gray-600">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {currentDoc.frontMatter.title}
            </h1>
            {currentDoc.frontMatter.description && (
              <p className="text-gray-600 dark:text-gray-300">
                {currentDoc.frontMatter.description}
              </p>
            )}
          </header>

          {/* MDX Content */}
          <div className="prose prose-lg prose-blue dark:prose-invert p-6">
            <MDXRemote source={currentDoc.content} components={mdxComponents} />
          </div>

          {/* Pagination */}
          <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            {prevDoc && (
              <Link 
                href={`/docs?page=${prevDoc.slug}`} 
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {prevDoc.frontMatter.title}
              </Link>
            )}
            
            {nextDoc && (
              <Link 
                href={`/docs?page=${nextDoc.slug}`} 
                className="ml-auto flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
              >
                {nextDoc.frontMatter.title}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </Link>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}