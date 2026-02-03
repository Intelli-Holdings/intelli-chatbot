import Link from 'next/link';
import { getAvailableVersions, getReleaseNote } from '@/utils/release-notes';

export default function ReleaseNotesIndex() {
  const versions = getAvailableVersions();

  return (
    <div className=" px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Release Notes</h1>
      <div className="space-y-6">
        {versions.map((version) => {
          const note = getReleaseNote(version);
          if (!note) return null;

          return (
            <div key={version} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <Link href={`/changelog/release-notes/${version}`}>
                <h2 className="text-2xl font-semibold mb-2">Version {version}</h2>
                <p className="text-sm text-muted-foreground mb-4">{note.date}</p>
                <p className="text-gray-600 dark:text-gray-300">{note.sections.whatsNew.overview}</p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}