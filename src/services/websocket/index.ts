// ====================================================
// File Name   : index.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-11-23
// Last Update : 2025-11-23

// Description:
// - Barrel export file for WebSocket service module
// - Re-exports WebSocketService, useWebSocket hook, and all types
// - Provides centralized access to WebSocket functionality

// Notes:
// - All exports are re-exported from their respective source files
// - Types are exported using wildcard export for convenience
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
// No imports - direct re-exports only

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
// No constants - barrel export file only

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
// Types are re-exported from ./types

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
export { WebSocketService } from './WebSocketService';
export { useWebSocket } from './useWebSocket';
export * from './types';
