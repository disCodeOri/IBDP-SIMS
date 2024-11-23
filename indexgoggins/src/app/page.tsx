import { Command } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-goggins-darker">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-red-700 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-red-900 after:via-red-700 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-red-900 before:dark:opacity-10 after:dark:from-red-900 after:dark:via-[#ff0000] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-6xl font-bold text-white">GOGGINS MODE</h1>
      </div>

      <div className="mt-20">
        <Button
          variant="outline"
          className="text-white border-red-800 hover:bg-red-900 hover:text-white"
        >
          <Command className="mr-2 h-4 w-4" /> Press <span className="ml-1">⌘K</span>
        </Button>
      </div>
    </main>
  )
}

