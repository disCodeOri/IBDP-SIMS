import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export const use404Redirect = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentPathSegments = pathname.split('/').filter(Boolean);
    const parentPathSegments = currentPathSegments.slice(0, -1);
    const parentPath = parentPathSegments.length ? `/${parentPathSegments.join('/')}` : '/';
    
    router.push(parentPath);
  }, [pathname, router]);
};