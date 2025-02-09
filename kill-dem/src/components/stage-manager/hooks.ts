import { useState, useContext } from "react";

import { ManagerContext, SpaceContext } from "./contexts";

export function useSpaceId(): [
  string,
  React.Dispatch<React.SetStateAction<string>>
] {
  const uuid =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const [state, setState] = useState<string>(uuid);
  return [state, setState] as const;
}

export function usePosition(
  initial_position: [number, number] | "random" | "auto"
): [[number, number], React.Dispatch<React.SetStateAction<[number, number]>>] {
  const { size } = useContext(ManagerContext);
  const { lastWindowPosition } = useContext(SpaceContext);

  let position: [number, number];

  if (initial_position === "random") {
    position = [
      Math.floor(Math.random() * size[0]),
      Math.floor(Math.random() * size[1]),
    ];
  } else if (initial_position === "auto") {
    position = [lastWindowPosition[0] + 20, lastWindowPosition[1] + 20];
  } else {
    position = initial_position;
  }

  const [state, setState] = useState<[number, number]>(position);

  return [state, setState] as const;
}

export function useSize(
  initial_size: [number, number]
): [[number, number], React.Dispatch<React.SetStateAction<[number, number]>>] {
  const [state, setState] = useState<[number, number]>(initial_size);

  return [state, setState] as const;
}
