'use client';

import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useLoading } from '../context/LoadingContext';
import { useCallback, useEffect, useRef } from 'react';

export function useLoadingRouter() {
  const router = useNextRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoading();

  const previousPath = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    if (previousPath.current !== currentPath) {
      hideLoading();
      previousPath.current = currentPath;
    }
  }, [pathname, searchParams, hideLoading]);

  const push = useCallback(
    (href, options) => {
      const currentPath = pathname + searchParams.toString();
      const newPath = href.split('?')[0] + (href.split('?')[1] || '');
      if(currentPath !== newPath) {
        showLoading();
      }
      router.push(href, options);
    },
    [router, showLoading, pathname, searchParams]
  );

  const replace = useCallback(
    (href, options) => {
      const currentPath = pathname + searchParams.toString();
      const newPath = href.split('?')[0] + (href.split('?')[1] || '');
      if(currentPath !== newPath) {
        showLoading();
      }
      router.replace(href, options);
    },
    [router, showLoading, pathname, searchParams]
  );

  const back = useCallback(() => {
    showLoading();
    router.back();
  }, [router, showLoading]);

  const forward = useCallback(() => {
    showLoading();
    router.forward();
  }, [router, showLoading]);

  return {
    ...router,
    push,
    replace,
    back,
    forward,
  };
}