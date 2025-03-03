import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react";

/**
 * Data definition for the sidebar component.
 * This data structure is used to populate the sidebar with user information,
 */
export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  spaces: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  utilities: [
    {
      name: "Cookie Jar",
      url: "/CookieJar",
      icon: PieChart,
    },
    {
      name: "Doubt Tracker",
      url: "/DoubtTracker",
      icon: Map,
    },
    {
      name: "Curiosity Space",
      url: "/CuriositySpace",
      icon: Map,
    },
    {
      name: "Continuous Information Space",
      url: "/ContinuousInfoSpaceDocMan",
      icon: Frame,
    },
    {
      name: "ToDoList",
      url: "/ToDoList",
      icon: Map,
    },
  ],
};
