"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function use404Redirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const response = await fetch(pathname);
        if (response.status === 404) {
          const segments = pathname.split('/').filter(Boolean);
          if (segments.length > 0) {
            const parentPath = `/${segments.slice(0, -1).join('/')}`;
            router.push(parentPath);
          } else {
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error checking page:', error);
      }
    };

    checkAndRedirect();
  }, [pathname, router]);
}