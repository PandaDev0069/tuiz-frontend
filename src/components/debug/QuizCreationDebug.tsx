'use client';

import React, { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Clock, FileText, Settings, CheckCircle, Move, Minimize2, Maximize2 } from 'lucide-react';

interface QuizCreationDebugProps {
  currentStep?: number;
  quizId?: string | null;
  formData?: Record<string, unknown>;
}

export const QuizCreationDebug: React.FC<QuizCreationDebugProps> = ({
  currentStep = 1,
  quizId = null,
  formData = {},
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const pathname = usePathname();

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't start dragging if clicking on interactive elements
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea');

      if (!isInteractive) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [position],
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 250, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y));

        setPosition({ x: newX, y: newY });
      }
    },
    [isDragging, dragStart],
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse events for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (process.env.NODE_ENV !== 'development' || !pathname.includes('/create')) {
    return null;
  }

  const stepIcons = {
    1: <FileText size={12} />,
    2: <Clock size={12} />,
    3: <Settings size={12} />,
    4: <CheckCircle size={12} />,
  };

  const stepNames = {
    1: 'Basic Info',
    2: 'Questions',
    3: 'Settings',
    4: 'Final',
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        borderRadius: '8px',
        border: isDragging
          ? '2px solid rgba(191, 240, 152, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.3)',
        fontFamily: 'monospace',
        fontSize: '11px',
        minWidth: '250px',
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging
          ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(191, 240, 152, 0.2)'
          : '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div
        className="drag-handle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: showDetails && !isMinimized ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
          cursor: 'grab',
          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          borderRadius: '8px 8px 0 0',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
          <Move size={14} style={{ color: '#9ca3af' }} />
          {stepIcons[currentStep as keyof typeof stepIcons] || <FileText size={14} />}
          <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>Quiz Creation Debug</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: '#9ca3af', fontSize: '10px', pointerEvents: 'none' }}>
            Step {currentStep}/4
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Content - Hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Step Progress Indicator */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: step <= currentStep ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '2px',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: '#9ca3af',
              }}
            >
              {Object.entries(stepNames).map(([step, name]) => (
                <span
                  key={step}
                  style={{
                    color: Number(step) === currentStep ? '#fbbf24' : '#9ca3af',
                    fontWeight: Number(step) === currentStep ? 'bold' : 'normal',
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Quiz ID Status */}
          <div style={{ padding: '0 12px 8px' }}>
            <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Quiz ID:</span>
              <span
                style={{
                  color: quizId ? '#10b981' : '#ef4444',
                  fontFamily: 'monospace',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '9px',
                }}
              >
                {quizId ? `${quizId.substring(0, 8)}...` : 'Not created'}
              </span>
              {quizId && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse 2s infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Toggle Details Button */}
          <div style={{ padding: '0 12px 8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: showDetails ? '#ef4444' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 'medium',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Expanded Details */}
          {showDetails && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Form Data:</span>
              </div>
              <div
                style={{
                  fontSize: '9px',
                  color: '#9ca3af',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '6px',
                  borderRadius: '4px',
                }}
              >
                {Object.keys(formData).length > 0 ? (
                  Object.entries(formData).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '2px', wordBreak: 'break-word' }}>
                      <span style={{ color: '#fbbf24' }}>{key}:</span>{' '}
                      <span style={{ color: '#9ca3af' }}>
                        {typeof value === 'string'
                          ? value.length > 30
                            ? `${value.substring(0, 30)}...`
                            : value
                          : typeof value === 'object' && value !== null
                            ? Array.isArray(value)
                              ? `[Array(${value.length})]`
                              : '[Object]'
                            : String(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#ef4444', textAlign: 'center', padding: '8px' }}>
                    No form data available
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div
                style={{
                  marginTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '8px',
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('📊 Quiz Creation State:', {
                      currentStep,
                      quizId,
                      formData,
                      pathname,
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '9px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Log State
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(
                      JSON.stringify({ currentStep, quizId, formData }, null, 2),
                    );
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '9px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Copy Data
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* CSS Animation for pulse effect */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
