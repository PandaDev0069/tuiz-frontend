// ====================================================
// File Name   : QRCode.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2025-09-21
//
// Description:
// - QR Code component for displaying QR codes
// - Uses qrcode library to generate QR codes on canvas
// - Supports custom size and styling
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React hooks (useEffect, useRef)
// - Requires qrcode library dependency
// ====================================================

'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

// ====================================================
// Constants
// ====================================================

const DEFAULT_SIZE = 200;
const DEFAULT_CLASS_NAME = '';
const QR_CODE_MARGIN = 2;
const QR_CODE_COLOR_DARK = '#000000';
const QR_CODE_COLOR_LIGHT = '#FFFFFF';

// ====================================================
// Types
// ====================================================

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}

interface CanvasStyle {
  width: number;
  height: number;
}

// ====================================================
// Helper Functions
// ====================================================

/**
 * Function: getQRCodeOptions
 * Description:
 * - Returns QR code generation options
 * - Configures width, margin, and colors
 *
 * Parameters:
 * - size (number): QR code size in pixels
 *
 * Returns:
 * - QRCodeOptions: Configuration object for QR code generation
 */
const getQRCodeOptions = (size: number): QRCodeOptions => {
  return {
    width: size,
    margin: QR_CODE_MARGIN,
    color: {
      dark: QR_CODE_COLOR_DARK,
      light: QR_CODE_COLOR_LIGHT,
    },
  };
};

/**
 * Function: getCanvasStyle
 * Description:
 * - Returns inline style object for canvas element
 * - Sets width and height to match QR code size
 *
 * Parameters:
 * - size (number): Canvas size in pixels
 *
 * Returns:
 * - CanvasStyle: Style object with width and height
 */
const getCanvasStyle = (size: number): CanvasStyle => {
  return {
    width: size,
    height: size,
  };
};

/**
 * Function: handleQRCodeError
 * Description:
 * - Handles QR code generation errors
 * - Logs error to console
 *
 * Parameters:
 * - error (Error): Error object from QR code generation
 */
const handleQRCodeError = (error: Error): void => {
  console.error('QR Code generation error:', error);
};

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: QRCode
 * Description:
 * - Renders a QR code on a canvas element
 * - Generates QR code using qrcode library
 * - Updates QR code when value or size changes
 *
 * Parameters:
 * - value (string): Text or URL to encode in QR code
 * - size (number, optional): QR code size in pixels (default: 200)
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: Canvas element with generated QR code
 *
 * Example:
 * ```tsx
 * <QRCode value="https://example.com" size={300} />
 * ```
 */
export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = DEFAULT_SIZE,
  className = DEFAULT_CLASS_NAME,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, getQRCodeOptions(size)).catch(handleQRCodeError);
    }
  }, [value, size]);

  return <canvas ref={canvasRef} className={className} style={getCanvasStyle(size)} />;
};
