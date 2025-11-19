'use client';

import "./Summary.css";
import { useState, useEffect } from "react";
import Loader from './Loader';
import { SummaryProps, LoadingStatus } from '@/types';

function Summary({ file }: SummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [status, setStatus] = useState<LoadingStatus>("idle");

  async function getSummary() {
    setStatus('loading');

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: file }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get summary');
      }

      setStatus('success');
      setSummary(data.summary);
    } catch (error) {
      console.error('Error getting summary:', error);
      setStatus('error');
    }
  }

  useEffect(() => {
    if (status === 'idle') {
      getSummary();
    }
  }, [status]);

  return (
    <section className="h-50% summary mx-auto max-w-3xl pb-12 text-center md:pb-20">
      {file.imageUrl && <img src={file.imageUrl} alt="Document preview" />}

      <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
        <span className="inline-flex bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
          Summary
        </span>
      </div>
      {status === 'loading' ? (
        <Loader />
      ) : status === 'success' ? (
        <p className="sum-text">{summary}</p>
      ) : status === 'error' ? (
        <p className="sum-error">Error getting the summary</p>
      ) : null}
    </section>
  );
}

export default Summary;
