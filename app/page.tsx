import QpaCalculator from '@/components/QpaCalculator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-24">
      <h1 className="text-3xl font-bold mb-8 text-primary">
        CMU QPA Calculator
      </h1>
      <QpaCalculator />
    </main>
  );
}

