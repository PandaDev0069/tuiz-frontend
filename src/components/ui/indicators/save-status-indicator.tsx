// ====================================================
// File Name   : save-status-indicator.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-14
// Last Update : 2025-09-14
//
// Description:
// - Save status indicator component for displaying save state during editing
// - Shows different states: saving, saved, error, idle
// - Displays last saved time when available
// - Uses icons and colors to indicate status
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses SaveStatus type from useEditSave hook
// ====================================================

import React from 'react';
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { SaveStatus } from '@/hooks/useEditSave';

const DEFAULT_CLASSNAME = '';

const LOCALE_JA_JP = 'ja-JP';
const TIME_OPTIONS = {
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};

const CONTAINER_CLASSES = 'inline-flex items-center';
const STATUS_CONTAINER_CLASSES = 'flex items-center gap-2';
const TEXT_SIZE_SM = 'text-sm';
const TEXT_SIZE_XS = 'text-xs';
const TEXT_COLOR_GRAY = 'text-gray-500';
const TEXT_COLOR_BLUE = 'text-blue-600';
const TEXT_COLOR_GREEN = 'text-green-600';
const TEXT_COLOR_RED = 'text-red-600';
const FONT_MEDIUM = 'font-medium';
const MARGIN_LEFT = 'ml-1';

const ICON_CLASSES = 'w-4 h-4';
const SPINNER_CLASSES = 'w-4 h-4 animate-spin';

export interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  className?: string;
}

/**
 * Function: formatLastSavedTime
 * Description:
 * - Formats last saved date to Japanese locale time string
 * - Returns formatted time in HH:mm format
 *
 * Parameters:
 * - date (Date): Date object to format
 *
 * Returns:
 * - string: Formatted time string
 *
 * Example:
 * ```ts
 * const time = formatLastSavedTime(new Date());
 * // Returns "14:30"
 * ```
 */
const formatLastSavedTime = (date: Date): string => {
  return date.toLocaleTimeString(LOCALE_JA_JP, TIME_OPTIONS);
};

/**
 * Function: getStatusContent
 * Description:
 * - Returns JSX content based on save status
 * - Handles all status types: saving, saved, error, idle
 * - Includes last saved time for saved status
 *
 * Parameters:
 * - status (SaveStatus): Current save status
 * - lastSaved (Date | null | undefined): Last saved date
 *
 * Returns:
 * - React.ReactElement: Status indicator content
 *
 * Example:
 * ```ts
 * const content = getStatusContent('saving', null);
 * // Returns saving indicator
 * ```
 */
const getStatusContent = (
  status: SaveStatus,
  lastSaved: Date | null | undefined,
): React.ReactElement => {
  switch (status) {
    case 'saving':
      return (
        <div className={`${STATUS_CONTAINER_CLASSES} ${TEXT_COLOR_BLUE}`}>
          <Loader2 className={SPINNER_CLASSES} />
          <span className={`${TEXT_SIZE_SM} ${FONT_MEDIUM}`}>保存中...</span>
        </div>
      );

    case 'saved':
      return (
        <div className={`${STATUS_CONTAINER_CLASSES} ${TEXT_COLOR_GREEN}`}>
          <CheckCircle className={ICON_CLASSES} />
          <span className={`${TEXT_SIZE_SM} ${FONT_MEDIUM}`}>
            保存済み
            {lastSaved && (
              <span className={`${TEXT_SIZE_XS} ${TEXT_COLOR_GRAY} ${MARGIN_LEFT}`}>
                ({formatLastSavedTime(lastSaved)})
              </span>
            )}
          </span>
        </div>
      );

    case 'error':
      return (
        <div className={`${STATUS_CONTAINER_CLASSES} ${TEXT_COLOR_RED}`}>
          <AlertCircle className={ICON_CLASSES} />
          <span className={`${TEXT_SIZE_SM} ${FONT_MEDIUM}`}>保存エラー</span>
        </div>
      );

    case 'idle':
    default:
      return (
        <div className={`${STATUS_CONTAINER_CLASSES} ${TEXT_COLOR_GRAY}`}>
          <Clock className={ICON_CLASSES} />
          <span className={TEXT_SIZE_SM}>未保存</span>
        </div>
      );
  }
};

/**
 * Component: SaveStatusIndicator
 * Description:
 * - Displays save status indicator during editing
 * - Shows different states with icons and colors
 * - Displays last saved time when available
 * - Provides visual feedback for save operations
 *
 * Parameters:
 * - status (SaveStatus): Current save status ('saving' | 'saved' | 'error' | 'idle')
 * - lastSaved (Date | null, optional): Last saved date
 * - className (string, optional): Additional CSS classes (default: '')
 *
 * Returns:
 * - React.ReactElement: The save status indicator component
 *
 * Example:
 * ```tsx
 * <SaveStatusIndicator status="saving" />
 * <SaveStatusIndicator status="saved" lastSaved={new Date()} />
 * ```
 */
export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved,
  className = DEFAULT_CLASSNAME,
}) => {
  return (
    <div className={`${CONTAINER_CLASSES} ${className}`}>{getStatusContent(status, lastSaved)}</div>
  );
};
