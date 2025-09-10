import React from 'react';

interface FormHeaderProps {
  title: string;
  description: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title, description }) => {
  return (
    <div className="text-center mb-4 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">{title}</h2>
      <p className="text-sm md:text-base text-gray-600">{description}</p>
    </div>
  );
};
