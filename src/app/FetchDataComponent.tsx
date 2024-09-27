'use client';

import { useEffect, useState } from 'react';

export default function FetchDataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicKey: 'yourPublicKey',
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        console.log('Response from API:', result);
        setData(result);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  //if (error) return <p>Error: {error}</p>;
  if (data) return <pre>{JSON.stringify(data, null, 2)}</pre>;

  return null;
}
