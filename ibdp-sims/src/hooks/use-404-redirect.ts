import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Hook to redirect users to the parent directory in case of a 404-like situation.
 * This is particularly useful for scenarios where users might navigate to a non-existent child route,
 * and a more user-friendly behavior is to redirect them to the nearest existing parent route.
 */
export const use404Redirect = () => {
  // useRouter hook from next/navigation to programmatically navigate between routes.
  const router = useRouter();
  // usePathname hook to get the current pathname of the URL.
  const pathname = usePathname();

  useEffect(() => {
    // Split the pathname into segments (parts of the path divided by '/') and filter out any empty segments.
    const currentPathSegments = pathname.split("/").filter(Boolean);
    // Create an array of parent path segments by removing the last segment (current page).
    const parentPathSegments = currentPathSegments.slice(0, -1);
    // Join the parent path segments back together with '/' to form the parent path.
    // If there are no parent segments, default to the root path '/'.
    const parentPath = parentPathSegments.length
      ? `/${parentPathSegments.join("/")}`
      : "/";

    // Programmatically redirect the user to the constructed parent path.
    // This effect runs whenever the pathname changes, ensuring redirection if a 404-like path is accessed.
    router.push(parentPath);
  }, [pathname, router]); // Effect dependencies: pathname and router. The effect re-runs if either of these change.
};