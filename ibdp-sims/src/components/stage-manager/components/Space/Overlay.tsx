import React from "react";
import classNames from "classnames";
import styles from "./Overlay.module.css";

/**
 * Component for displaying an overlay with space thumbnails.
 * This overlay is typically used to switch between different workspaces or spaces within the application.
 */
export function Overlay({
  spaces, // Number of spaces to display thumbnails for
  activeSpace, // Index of the currently active space
  onSpaceHover, // Callback function to handle space thumbnail hover, typically to preview a space
}: {
  spaces: number;
  activeSpace: number;
  onSpaceHover: (space: number) => void;
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.horizontalRow}>
        {/* Map over the number of spaces to create thumbnail elements */}
        {Array.from({ length: spaces }).map((_, index) => (
          <div
            key={index}
            className={classNames(styles.thumbnail, {
              [styles.active]: index === activeSpace, // Apply 'active' style if this thumbnail represents the active space
            })}
            onMouseEnter={() => onSpaceHover(index)} // Call onSpaceHover callback when mouse enters a thumbnail, passing the space index
          >
            <div className={styles.label}>Space {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
