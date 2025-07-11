// app/api/medium/route.ts
import Parser from 'rss-parser';

export async function GET() {
  const parser = new Parser();
  const feed = await parser.parseURL('https://medium.com/feed/@intelli');
  return new Response(JSON.stringify(feed), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
