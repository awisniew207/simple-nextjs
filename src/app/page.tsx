'use client';

import React, { useState } from 'react';
import { signAndCombineAndSendTx } from './litcode'; // Assuming the function is exported from this file

const LitIntegrationPage = () => {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRunIntegration = async () => {
    setIsLoading(true);
    setOutput('');
    try {
      const result = await signAndCombineAndSendTx();
      setOutput(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Lit Protocol + Next.js</h1>
      <button 
        onClick={handleRunIntegration}
        disabled={isLoading}
        className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:bg-gray-200 mb-4"
      >
        {isLoading ? 'Running...' : 'Perform signAndCombineEcdsa'}
      </button>
      {output && (
        <pre className="bg-gray-700 text-white p-4 rounded-md overflow-auto w-full">
          {output}
        </pre>
      )}
    </div>
  );
};

export default LitIntegrationPage;