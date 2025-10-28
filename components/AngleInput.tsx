
import React from 'react';
import { BookAngle } from '../types';

interface AngleInputProps {
  angle: BookAngle;
  value: string;
  onChange: (id: string, value: string) => void;
}

export const AngleInput: React.FC<AngleInputProps> = ({ angle, value, onChange }) => {
  const InputComponent = angle.id === 'bookTitle' ? 'input' : 'textarea';
  
  return (
    <div className="mb-6">
      <label htmlFor={angle.id} className="block text-lg font-bold mb-2 text-[#667eea] dark:text-[#8b9ef7]">
        <span className="mr-2">{angle.emoji}</span>{angle.name}
      </label>
      <InputComponent
        id={angle.id}
        name={angle.id}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(angle.id, e.target.value)}
        placeholder={angle.placeholder}
        className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors duration-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-[#8b9ef7]"
        rows={InputComponent === 'textarea' ? 4 : undefined}
      />
      <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">{angle.helpText}</p>
    </div>
  );
};