// ====================================================
// File Name   : index.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-09-18
//
// Description:
// - Barrel export file for UI overlay components
// - Centralizes exports for modal, dialog, and overlay components
// - Simplifies imports across the application
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Re-exports all overlay-related UI components
// ====================================================

export { SidebarFilter } from './sidebar-filter';
export { ProfileSettingsModal } from './profile-settings-modal';
export { WarningModal, useWarningModal } from './warning-modal';
export { HostSettingsModal } from './host-settings-modal';
