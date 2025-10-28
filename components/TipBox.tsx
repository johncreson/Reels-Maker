
import React, { ReactNode } from 'react';

interface TipBoxProps {
    children: ReactNode;
}

export const TipBox: React.FC<TipBoxProps> = ({ children }) => {
  return (
    <div className="bg-[#e7f3ff] dark:bg-blue-900/50 border-l-4 border-[#667eea] dark:border-blue-400 text-blue-800 dark:text-blue-200 p-4 rounded-r-lg" role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-[#667eea] dark:text-blue-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
        </div>
        <div>
          <p className="text-lg">{children}</p>
        </div>
      </div>
    </div>
  );
};