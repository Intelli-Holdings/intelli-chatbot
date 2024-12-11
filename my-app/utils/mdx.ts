import { bundleMDX } from 'mdx-bundler';
import path from 'path';
import fs from 'fs';

export async function getMdxContent(slug: string) {
  const filePath = path.join(process.cwd(), 'content/docs', `${slug}.mdx`);
  const source = fs.readFileSync(filePath, 'utf8');

  const { code, frontmatter } = await bundleMDX({
    source,
    cwd: process.cwd(),
    mdxOptions(options) {
      options.remarkPlugins = [...(options.remarkPlugins ?? [])];
      options.rehypePlugins = [...(options.rehypePlugins ?? [])];
      return options;
    },
  });

  return {
    code,
    frontmatter,
  };
}