import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sentiment } from '@/app/dashboard/conversations/components/types'; // Adjust the import path as necessary

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


const RightSidebar: React.FC = () => {
  const [sentiments, setSentiments] = useState<Sentiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentiments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/monitoring/sentiment_analysis/`);
        if (!response.ok) {
          throw new Error('Failed to fetch sentiments');
        }
        const data = await response.json();
        setSentiments(data.sentiments.result);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchSentiments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold p-2">Sentiment Analysis</h2>
        {/* Render sentiments here */}
        {sentiments.map((sentiment, index) => (
          <div key={index}>
            <p>Content: {sentiment.content}</p>
            <p>Sentiment: {sentiment.sentiment.join(', ')}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RightSidebar;
