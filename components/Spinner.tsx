
import React from 'react';

interface SpinnerProps {
    message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center my-8">
      <div className="w-12 h-12 border-4 border-t-transparent border-[#667eea] rounded-full animate-spin"></div>
      {message && <p className="mt-4 text-lg text-gray-600 font-semibold">{message}</p>}
    </div>
  );
};
