// ====================================================
// File Name   : utils.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-20
//
// Description:
// - Utility functions for common operations
// - Provides class name merging utility for Tailwind CSS
// - Combines clsx and tailwind-merge for conditional class handling
//
// Notes:
// - Used throughout the codebase for conditional Tailwind class names
// - Handles class conflicts and conditional class application
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Function: cn
 * Description:
 * - Merges and deduplicates Tailwind CSS class names
 * - Combines clsx for conditional classes and twMerge for conflict resolution
 * - Ensures Tailwind classes are properly merged (e.g., conflicting utilities)
 *
 * Parameters:
 * - inputs (...ClassValue[]): Variable number of class name inputs (strings, objects, arrays)
 *
 * Returns:
 * - string: Merged and deduplicated class name string
 *
 * Example:
 * ```ts
 * cn('px-2', 'py-1', { 'bg-red-500': isActive }, 'px-4') // Returns: 'py-1 bg-red-500 px-4'
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
