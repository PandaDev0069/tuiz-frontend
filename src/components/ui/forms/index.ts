// ====================================================
// File Name   : index.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-09-02
//
// Description:
// - Barrel export file for UI form components
// - Centralizes exports for input, checkbox, select, and other form components
// - Simplifies imports across the application
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Re-exports all form-related UI components
// ====================================================

export { Input } from './input';
export { InputField } from './input-field';
export { PasswordField } from './password-field';
export { Checkbox } from './checkbox';
export { SearchBar } from './search-bar';
export { Label } from './label';
export { Textarea } from './textarea';
export { Switch } from './switch';
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
