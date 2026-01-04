// ====================================================
// File Name   : index.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-24
// Last Update : 2025-08-24
//
// Description:
// - Barrel export file for all type definitions
// - Centralizes type exports for convenient importing
// - Re-exports types from individual type modules
//
// Notes:
// - Import types from this file: import { Type } from '@/types'
// - Some types have naming conflicts and should be imported directly:
//   - ValidationError: import from './api' or './errors' as needed
//   - Question: import from './quiz' (quiz management) or './game' (gameplay) as needed
//   - Dashboard types: import directly from './dashboard'
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
export * from './auth';
export * from './dashboard';
