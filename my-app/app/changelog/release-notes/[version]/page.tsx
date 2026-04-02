import { getReleaseNote, getAvailableVersions } from '@/utils/release-notes';
import { notFound } from 'next/navigation';
import { ReleaseNoteContent } from '../components/ReleaseNoteContent';

export async function generateStaticParams() {
  const versions = getAvailableVersions();
  return versions.map((version) => ({
    version,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const releaseNote = getReleaseNote(version);
  if (!releaseNote) return {};

  return {
    title: `Release Notes v${releaseNote.version} - Intelli`,
    description: releaseNote.sections.whatsNew.overview,
    openGraph: {
      title: `Release Notes v${releaseNote.version} - Intelli`,
      description: releaseNote.sections.whatsNew.overview,
    },
  };
}

export default async function ReleaseNotePage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const releaseNote = getReleaseNote(version);

  if (!releaseNote) {
    notFound();
  }

  return <ReleaseNoteContent releaseNote={releaseNote} version={version} />;
}