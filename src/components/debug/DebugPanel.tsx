'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/state/useAuthStore';
import { ChevronDown, ChevronUp, Bug, User, Database, Wifi } from 'lucide-react';

interface DebugPanelProps {
  isSocketConnected?: boolean;
  socketError?: string | null;
}

interface CacheStats {
  totalQueries: number;
  staleQueries: number;
  activeQueries: number;
  quizListCache: unknown;
}

interface AuthUser {
  id: string;
  email: string;
}

// Main DebugPanel component
export const DebugPanel: React.FC<DebugPanelProps> = ({
  isSocketConnected = false,
  socketError = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasQueryClient, setHasQueryClient] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalQueries: 0,
    staleQueries: 0,
    activeQueries: 0,
    quizListCache: null,
  });

  const { user, session, loading } = useAuthStore();

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
        const newX = Math.max(0, Math.min(window.innerWidth - 350, e.clientX - dragStart.x));
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
  useEffect(() => {
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

  // Check if QueryClient is available and get cache stats
  useEffect(() => {
    if (!isExpanded) return;

    const updateCacheStats = async () => {
      try {
        // Try to dynamically import react-query and check if QueryClient is available
        const reactQuery = await import('@tanstack/react-query');
        const queryKeys = await import('@/hooks/useQuizMutation').catch(() => null);

        // Check if we can access a QueryClient instance
        const queryClient = (reactQuery as { useQueryClient?: () => unknown }).useQueryClient?.();

        if (queryClient && typeof queryClient === 'object' && queryClient !== null) {
          setHasQueryClient(true);

          const queryCache = (
            queryClient as { getQueryCache: () => { getAll: () => unknown[] } }
          ).getQueryCache();
          const queries = queryCache.getAll();

          // Use type assertion for safer filtering
          const stale = queries.filter((q) => {
            try {
              return (q as { isStale?: () => boolean })?.isStale?.() ?? false;
            } catch {
              return false;
            }
          }).length;

          const active = queries.filter((q) => {
            try {
              return ((q as { observers?: { length: number } })?.observers?.length ?? 0) > 0;
            } catch {
              return false;
            }
          }).length;

          // Get quiz list cache data if available
          let quizListCache = null;
          if (queryKeys?.QUIZ_QUERY_KEYS) {
            try {
              quizListCache = (
                queryClient as { getQueryData: (key: unknown) => unknown }
              ).getQueryData(queryKeys.QUIZ_QUERY_KEYS.lists());
            } catch {
              quizListCache = null;
            }
          }

          setCacheStats({
            totalQueries: queries.length,
            staleQueries: stale,
            activeQueries: active,
            quizListCache,
          });
        } else {
          setHasQueryClient(false);
        }
      } catch {
        // QueryClient not available or error occurred
        setHasQueryClient(false);
        setCacheStats({
          totalQueries: 0,
          staleQueries: 0,
          activeQueries: 0,
          quizListCache: null,
        });
      }
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 2000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  const handleClearCache = async () => {
    try {
      const reactQuery = await import('@tanstack/react-query');
      const queryClient = (reactQuery as { useQueryClient?: () => unknown }).useQueryClient?.();

      if (queryClient && typeof queryClient === 'object' && queryClient !== null) {
        (queryClient as { clear: () => void }).clear();
        console.log('🧹 Query cache cleared');
      } else {
        console.log('❌ Query client not available');
      }
    } catch {
      console.log('❌ Query client not available');
    }
  };

  const handleInvalidateQuizCache = async () => {
    try {
      const reactQuery = await import('@tanstack/react-query');
      const queryKeys = await import('@/hooks/useQuizMutation').catch(() => null);
      const queryClient = (reactQuery as { useQueryClient?: () => unknown }).useQueryClient?.();

      if (
        queryClient &&
        typeof queryClient === 'object' &&
        queryClient !== null &&
        queryKeys?.QUIZ_QUERY_KEYS
      ) {
        (
          queryClient as { invalidateQueries: (options: { queryKey: unknown }) => void }
        ).invalidateQueries({ queryKey: queryKeys.QUIZ_QUERY_KEYS.all });
        console.log('🔄 Quiz cache invalidated');
      } else {
        console.log('❌ Query client or query keys not available');
      }
    } catch {
      console.log('❌ Query client not available');
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        fontFamily: 'monospace',
        fontSize: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
        }}
        onMouseDown={handleMouseDown}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bug size={14} />
          <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>Debug Panel</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Socket Status Indicator */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isSocketConnected ? '#10b981' : '#ef4444',
              animation: isSocketConnected ? 'pulse 2s infinite' : 'none',
            }}
            title={`Socket.IO: ${isSocketConnected ? 'Connected' : 'Disconnected'}`}
          />

          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '12px' }}>
          {/* Socket.IO Status */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Wifi size={14} />
              <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>Socket.IO</span>
            </div>
            <div style={{ paddingLeft: '22px', fontSize: '11px' }}>
              <div>
                Status:{' '}
                <span style={{ color: isSocketConnected ? '#10b981' : '#ef4444' }}>
                  {isSocketConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {socketError && (
                <div
                  style={{
                    color: '#ef4444',
                    fontSize: '10px',
                    marginTop: '4px',
                    wordBreak: 'break-word',
                  }}
                >
                  Error: {socketError}
                </div>
              )}
            </div>
          </div>

          {/* Auth Status */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <User size={14} />
              <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>Auth</span>
            </div>
            <div style={{ paddingLeft: '22px', fontSize: '11px' }}>
              <div>
                User:{' '}
                <span style={{ color: user ? '#10b981' : '#ef4444' }}>
                  {user ? (user as AuthUser).email || 'Logged in' : 'Not logged in'}
                </span>
              </div>
              <div>
                Session:{' '}
                <span style={{ color: session ? '#10b981' : '#ef4444' }}>
                  {session ? 'Active' : 'None'}
                </span>
              </div>
              <div>
                Loading:{' '}
                <span style={{ color: loading ? '#fbbf24' : '#10b981' }}>
                  {loading ? 'Yes' : 'No'}
                </span>
              </div>
              {user && (user as AuthUser).id && (
                <div
                  style={{
                    fontSize: '10px',
                    marginTop: '4px',
                    color: '#9ca3af',
                    wordBreak: 'break-all',
                  }}
                >
                  ID: {(user as AuthUser).id}
                </div>
              )}
              {session && (
                <>
                  <div
                    style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div>
                      Token:{' '}
                      <span style={{ color: session.access_token ? '#10b981' : '#ef4444' }}>
                        {session.access_token
                          ? `${session.access_token.substring(0, 20)}...`
                          : 'None'}
                      </span>
                    </div>
                    <div>
                      Expires:{' '}
                      <span style={{ color: '#fbbf24' }}>
                        {new Date(session.expires_at * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      Is Expired:{' '}
                      <span
                        style={{
                          color: Date.now() / 1000 > session.expires_at ? '#ef4444' : '#10b981',
                        }}
                      >
                        {Date.now() / 1000 > session.expires_at ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cache Status */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Database size={14} />
              <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Query Cache</span>
              {!hasQueryClient && (
                <span style={{ fontSize: '10px', color: '#ef4444' }}>(Unavailable)</span>
              )}
            </div>
            <div style={{ paddingLeft: '22px', fontSize: '11px' }}>
              <div>
                Total Queries: <span style={{ color: '#fbbf24' }}>{cacheStats.totalQueries}</span>
              </div>
              <div>
                Active: <span style={{ color: '#10b981' }}>{cacheStats.activeQueries}</span>
              </div>
              <div>
                Stale: <span style={{ color: '#ef4444' }}>{cacheStats.staleQueries}</span>
              </div>

              {cacheStats.quizListCache !== null && (
                <div style={{ fontSize: '10px', marginTop: '4px', color: '#9ca3af' }}>
                  Quiz List:{' '}
                  {Array.isArray(cacheStats.quizListCache)
                    ? `${(cacheStats.quizListCache as unknown[]).length} items`
                    : 'Invalid format'}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleClearCache}
                disabled={!hasQueryClient}
                style={{
                  padding: '6px 10px',
                  backgroundColor: hasQueryClient ? '#ef4444' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: hasQueryClient ? 'pointer' : 'not-allowed',
                  opacity: hasQueryClient ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                }}
              >
                Clear All Cache
              </button>

              <button
                onClick={handleInvalidateQuizCache}
                disabled={!hasQueryClient}
                style={{
                  padding: '6px 10px',
                  backgroundColor: hasQueryClient ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: hasQueryClient ? 'pointer' : 'not-allowed',
                  opacity: hasQueryClient ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                }}
              >
                Refresh Quiz Cache
              </button>

              <button
                onClick={() => {
                  console.log('🐛 Debug Panel State:', {
                    isSocketConnected,
                    socketError,
                    user,
                    session,
                    loading,
                    hasQueryClient,
                    cacheStats,
                    timestamp: new Date().toISOString(),
                  });
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Log State to Console
              </button>
            </div>
          </div>
        </div>
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
