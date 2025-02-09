import React from "react";
import classNames from "classnames";
import styles from "./Overlay.module.css";

export function Overlay({
  spaces,
  activeSpace,
  onSpaceHover,
}: {
  spaces: number;
  activeSpace: number;
  onSpaceHover: (space: number) => void;
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.horizontalRow}>
        {Array.from({ length: spaces }).map((_, index) => (
          <div
            key={index}
            className={classNames(styles.thumbnail, {
              [styles.active]: index === activeSpace,
            })}
            onMouseEnter={() => onSpaceHover(index)}
          >
            <div className={styles.label}>Space {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
