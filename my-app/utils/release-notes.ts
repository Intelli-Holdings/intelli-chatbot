import { ReleaseNote } from '../types/release-notes';
import { releaseNotes as releaseNotesData } from '../data/release-notes';

const releaseNotes: Record<string, ReleaseNote> = releaseNotesData;

export const getAvailableVersions = () => {
    return Object.keys(releaseNotes).sort((a, b) => 
        parseFloat(b) - parseFloat(a)
    );
};

export const getReleaseNote = (version: string): ReleaseNote | null => {
    return releaseNotes[version] || null;
};
