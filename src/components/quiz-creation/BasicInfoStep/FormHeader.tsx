// ====================================================
// File Name   : FormHeader.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-03
// Last Update : 2025-09-03
//
// Description:
// - Header component for quiz creation forms
// - Displays title and description in a centered layout
// - Implements responsive design for mobile and desktop
//
// Notes:
// - Simple presentational component
// - Uses responsive text sizing and spacing
// ====================================================

import React from 'react';

interface FormHeaderProps {
  title: string;
  description: string;
}

/**
 * Component: FormHeader
 * Description:
 * - Renders a centered header with title and description
 * - Used in quiz creation forms to display section headers
 * - Implements responsive typography and spacing
 *
 * Parameters:
 * - title (string): The main title text to display
 * - description (string): The description text below the title
 *
 * Returns:
 * - React.ReactElement: The form header component
 *
 * Example:
 * ```tsx
 * <FormHeader
 *   title="基本情報"
 *   description="クイズの基本情報を入力してください"
 * />
 * ```
 */
export const FormHeader: React.FC<FormHeaderProps> = ({ title, description }) => {
  return (
    <div className="text-center mb-4 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">{title}</h2>
      <p className="text-sm md:text-base text-gray-600">{description}</p>
    </div>
  );
};
