// PrivacyPolicy.tsx
import { promises as fs } from 'fs';
import path from 'path';
import PrivacyPolicyClient from './PrivacyPolicyClient';

type Country = 'Ghana' | 'Kenya' | 'USA' | 'EU';

async function getPolicyContent() {
  const policiesDir = path.join(process.cwd(), 'policies');
  const policyFiles = ['Ghana.html', 'Kenya.html', 'USA.html', 'EU.html'];

  const policies: Record<Country, string> = {} as Record<Country, string>;
  for (const file of policyFiles) {
    const content = await fs.readFile(path.join(policiesDir, file), 'utf-8');
    const country = path.parse(file).name as Country;
    policies[country] = content;
  }

  return policies;
}

export default async function PrivacyPolicy() {
  const policyContent = await getPolicyContent();
  return <PrivacyPolicyClient initialPolicies={policyContent} />;
}