import Link from 'next/link'
import SearchNavigation from '@/components/SearchNavigation';

export default function Home() {
  return (
    /*<div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to the Scheduler App</h1>
      <Link href="/scheduler" className="text-blue-500 hover:text-blue-700">
        Go to Scheduler
      </Link>
    </div>*/
    <SearchNavigation />
  )
}