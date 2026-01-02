/**
 * Device ID Test Page
 *
 * This page demonstrates and tests the device ID functionality.
 * Navigate to /test/device-id to see it in action.
 */

'use client';

import { useState } from 'react';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useAuthStore } from '@/state/useAuthStore';
import { Button } from '@/components/ui/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/core/card';
import { Badge } from '@/components/ui/data-display/badge';
import { PageContainer } from '@/components/ui/core/page-container';
import { RefreshCw, CheckCircle, XCircle, Copy, Info } from 'lucide-react';

export default function DeviceIdTestPage() {
  const { deviceId, isLoading, resetDevice, deviceInfo } = useDeviceId();
  const getDeviceIdFromStore = useAuthStore((state) => state.getDeviceId);
  const [copiedState, setCopiedState] = useState<'idle' | 'copied'>('idle');
  const [storeDeviceId, setStoreDeviceId] = useState<string | null>(null);

  const handleCopy = async () => {
    if (deviceId) {
      await navigator.clipboard.writeText(deviceId);
      setCopiedState('copied');
      setTimeout(() => setCopiedState('idle'), 2000);
    }
  };

  const handleReset = () => {
    resetDevice();
    // Also update store device ID
    const newId = getDeviceIdFromStore();
    setStoreDeviceId(newId);
  };

  const handleTestStore = () => {
    const id = getDeviceIdFromStore();
    setStoreDeviceId(id);
  };

  return (
    <PageContainer entrance="fadeIn" className="min-h-screen py-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] bg-clip-text text-transparent">
            Device ID Test Page
          </h1>
          <p className="text-muted-foreground">Test the persistent device ID functionality</p>
        </div>

        {/* Main Device ID Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Device ID
            </CardTitle>
            <CardDescription>
              This ID persists across browser sessions and page reloads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading device ID...
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="bg-muted px-3 py-2 rounded-md text-sm font-mono flex-1 break-all">
                    {deviceId}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                    {copiedState === 'copied' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Device ID
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Device Info Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Detailed information about the device ID storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Has Device ID:</span>
              <Badge variant={deviceInfo.hasDeviceId ? 'default' : 'secondary'}>
                {deviceInfo.hasDeviceId ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yes
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    No
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Is Valid:</span>
              <Badge variant={deviceInfo.isValid ? 'default' : 'destructive'}>
                {deviceInfo.isValid ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Invalid
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Version:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {deviceInfo.version || 'N/A'}
              </code>
            </div>

            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">Stored Device ID:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs break-all text-right">
                {deviceInfo.deviceId || 'None'}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Auth Store Integration Card */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Auth Store Integration</CardTitle>
            <CardDescription>Test device ID access through the auth store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={handleTestStore}>
              Get Device ID from Store
            </Button>

            {storeDeviceId && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Store Device ID:</span>
                <code className="block bg-muted px-3 py-2 rounded-md text-sm font-mono break-all">
                  {storeDeviceId}
                </code>
                <div className="flex items-center gap-2 text-sm">
                  {storeDeviceId === deviceId ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Matches hook device ID ✓</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Does not match hook device ID</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card variant="accent">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Note the current device ID displayed above</li>
              <li>Click &quot;Reload Page&quot; - the device ID should remain the same</li>
              <li>Close this tab and reopen it - the device ID should still be the same</li>
              <li>Click &quot;Reset Device ID&quot; to generate a new one</li>
              <li>Open browser DevTools → Application → Local Storage to see the stored ID</li>
              <li>Test the Auth Store integration to ensure device ID is accessible globally</li>
            </ol>

            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="font-medium mb-1">Storage Key:</p>
              <code className="text-xs">tuiz_device_id</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
