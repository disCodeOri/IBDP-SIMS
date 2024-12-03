// src/components/PKM.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PKM = () => {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    // Check if we're on a Windows platform
    setIsWindows(
      /Windows/i.test(navigator.platform) || /Win/i.test(navigator.userAgent)
    );
  }, []);

  const openSiYuan = () => {
    if (!isWindows) {
      alert("This functionality is only available on Windows.");
      return;
    }

    try {
      // Array of potential launch methods
      const launchMethods = [
        () => window.open("siyuan://", "_self"), // Custom protocol handler
        () => window.open("ms-windows-store://pdp/?ProductId=9NBLGGH4R31Z"), // Windows Store
        () => {
          // Attempt to launch via executable paths
          const paths = [
            "C:\\Program Files\\SiYuan\\SiYuan.exe",
            "C:\\Program Files (x86)\\SiYuan\\SiYuan.exe",
            `${process.env.LOCALAPPDATA}\\SiYuan\\SiYuan.exe`,
          ];

          paths.forEach((path) => {
            try {
              // This is a placeholder. In a real Electron/desktop app,
              // you'd use a method like child_process.exec or a native API
              window.open(`file:///${path}`, "_self");
            } catch {
              // Removed unused error parameter
              console.log(`Failed to launch from ${path}`);
            }
          });
        },
      ];

      // Try each launch method
      for (const method of launchMethods) {
        try {
          method();
          return; // Stop if one method works
        } catch {
          // Removed unused error parameter
          console.log("Launch method failed");
        }
      }

      // If all methods fail
      alert("Could not launch SiYuan. Please ensure it is installed.");
    } catch {
      // Removed unused error parameter
      alert("Error launching SiYuan. Check console for details.");
    }
  };

  return (
    <div className="space-y-4">
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 0px 20px rgba(34, 197, 94, 0.6)",
          transition: { duration: 0.3 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() =>
            window.open(
              "https://idx.google.com/it-is-time-parth-6898425",
              "_blank"
            )
          }
        className="w-full bg-green-900 text-green-300 border-green-700 p-3 rounded-lg hover:bg-green-800 transition-all duration-300 flex items-center justify-center gap-2"
      >
        It is time Parth
      </motion.button>

      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 0px 20px rgba(34, 197, 94, 0.6)",
          transition: { duration: 0.3 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={openSiYuan}
        className="w-full bg-green-900 text-green-300 border-green-700 p-3 rounded-lg hover:bg-green-800 transition-all duration-300 flex items-center justify-center gap-2"
      >
        Open SiYuan
      </motion.button>

      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 0px 20px rgba(34, 197, 94, 0.6)",
          transition: { duration: 0.3 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() =>
            window.open("https://idx.google.com/ibdp-sims-189376", "_blank")
        }
        className="w-full bg-green-900 text-green-300 border-green-700 p-3 rounded-lg hover:bg-green-800 transition-all duration-300 flex items-center justify-center gap-2"
      >
        IBDP Sims
      </motion.button>
    </div>
  );
};

export default PKM;
