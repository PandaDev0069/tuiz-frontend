// ====================================================
// File Name   : index.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-21
//
// Description:
// - Barrel export file for UI feedback components
// - Centralizes exports for form feedback, loading, validation, and scroll components
// - Simplifies imports across the application
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Re-exports all feedback-related UI components
// ====================================================

export { ScrollArea, ScrollIndicator } from './scroll-area';
export { ScrollDemo } from './scroll-demo';
export { FormError } from './form-error';
export { FormSuccess } from './form-success';
export { Loader, Spinner } from './loader';
export { ValidationMessage } from './validation-message';
