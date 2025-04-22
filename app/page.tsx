import QpaCalculator from '@/components/QpaCalculator';

export default function Home() {
  return (
    <main className="h-full w-full flex flex-col items-center pt-12 md:pt-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-black px-4 md:px-0 text-center">
        CMU QPA Calculator
      </h1>
      <div className="flex-1 w-full overflow-y-auto">
        <QpaCalculator />
      </div>
    </main>
  );
}

