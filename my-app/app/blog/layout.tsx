import { BlogCopyPageWrapper } from "@/components/blog/copy-page-wrapper"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BlogCopyPageWrapper />
      {children}
    </>
  )
}
