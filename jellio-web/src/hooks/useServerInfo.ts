import { useEffect, useRef, useState } from 'react';
import useAccessToken from '@/hooks/useAccessToken.ts';
import { getServerInfo, startAddonSession } from '@/services/backendService.ts';
import type { ServerInfo, Maybe } from '@/types';

const useServerInfo = (): Maybe<ServerInfo> => {
  const accessToken = useAccessToken();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null | undefined>();

  const attemptedOnceRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const fetchServerInfo = async (): Promise<void> => {
      try {
        let activeToken = accessToken ?? undefined;

        if (!activeToken) {
          activeToken = await startAddonSession();
        }

        let info;
        try {
          info = await getServerInfo(activeToken);
        } catch (error: any) {
          const status = error?.response?.status as number | undefined;
          if ((status === 401 || status === 403) && accessToken !== activeToken) {
            activeToken = await startAddonSession();
            info = await getServerInfo(activeToken);
          } else {
            throw error;
          }
        }

        if (cancelled) return;
        setServerInfo({ accessToken: activeToken ?? '', ...info });
      } catch (error: any) {
        if (cancelled) return;
        // Only treat explicit auth failures as unauthenticated
        const status = error?.response?.status as number | undefined;
        if (status === 401 || status === 403) {
          setServerInfo(null);
          return;
        }
        console.warn('Non-auth error fetching server info (will not redirect):', error);
        // Retry once, then stop loading forever and show the login fallback.
        if (!attemptedOnceRef.current) {
          attemptedOnceRef.current = true;
          setTimeout(() => {
            if (!cancelled) void fetchServerInfo();
          }, 400);
        } else {
          setServerInfo(null);
        }
      }
    };

    void fetchServerInfo();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return serverInfo;
};

export default useServerInfo;
