import SearchNavigation from '@/components/SearchNavigation';
import { Command } from '@/components/ui/command';
import SearchContent from '@/components/SearchContent';

export default function Home() {
  /*return (
    //<SearchContent />
    <div className="min-h-screen flex items-start justify-center pt-32">
      <div className="w-full max-w-2xl">
        <Command className="rounded-lg">
          
          <SearchNavigation />
        </Command>
        <div className="mt-4 flex justify-center space-x-4 text-sm">
          <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">↑↓</kbd> to navigate</span>
          <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">enter</kbd> to select</span>
          <span><kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );*/
  return <SearchNavigation />;
}