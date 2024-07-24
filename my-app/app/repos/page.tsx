import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Repository = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
};

export default async function Page() {
  const res = await fetch("https://api.github.com/orgs/Sqweya-AI/repos");
  const data: Repository[] = await res.json();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.map((repo) => (
        <Card key={repo.id} className="w-full">
          <CardHeader>
            <CardTitle>{repo.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-2">{repo.full_name}</p>
            <p className="mb-2">{repo.description || 'No description available'}</p>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on GitHub
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}