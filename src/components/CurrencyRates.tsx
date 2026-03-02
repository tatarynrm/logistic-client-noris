// src/components/CurrencyRates.tsx
"use client";

import { useEffect, useState } from "react";
import { NBUCurrency } from "@/types/currency";

const currenciesToFetch = ["USD", "EUR", "PLN", "GBP"];

const CurrencyRates = () => {
  const [rates, setRates] = useState<NBUCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const formattedDate = `${year}${month}${day}`;

        const promises = currenciesToFetch.map(async (currency) => {
          const response = await fetch(
            `/api/currency?start=${formattedDate}&end=${formattedDate}&valcode=${currency.toLowerCase()}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch ${currency} rate`);
          }
          const data: NBUCurrency[] = await response.json();
          return data[0];
        });

        const results = await Promise.all(promises);
        setRates(results.filter((rate) => rate)); // Filter out any undefined rates
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4  rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Курси валют (НБУ)</h2>
      <ul className="flex flex-wrap gap-2"> 
        {rates.map((rate) => (
          <li key={rate.cc} className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">{rate.txt} ({rate.cc})</span>
            <span className="font-bold text-lg">{rate.rate.toFixed(2)} грн</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyRates;
