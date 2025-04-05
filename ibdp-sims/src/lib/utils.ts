import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join class names together.
 * It uses `clsx` to handle conditional class names and `tailwind-merge` to resolve Tailwind CSS class conflicts.
 * This ensures that class names are efficiently combined and that Tailwind styles are applied correctly,
 * especially when dealing with conditional styling or component composition.
 *
 * @param inputs - An array of class names or conditional class objects.
 *                 These can be strings, objects (for conditional classes), or arrays of class names.
 * @returns A single string containing all the resolved class names, with Tailwind CSS conflicts intelligently merged.
 *
 * @example
 * // Basic usage
 * cn("class1", "class2"); // returns "class1 class2"
 *
 * @example
 * // Conditional class names
 * cn("class1", true ? "class2" : "class3"); // returns "class1 class2" if true, "class1 class3" if false
 *
 * @example
 * // Merging Tailwind classes
 * cn("p-2", "py-4"); // returns "py-4" (tailwind-merge ensures py-4 overrides p-2 in vertical padding)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}