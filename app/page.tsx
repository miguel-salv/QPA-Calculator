import QpaCalculator from '@/components/QpaCalculator';
import { Mail, Github } from 'lucide-react';

export default function Home() {
  return (
    <main className="h-full w-full flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-black px-4 md:px-0 text-center">
        CMU QPA Calculator
      </h1>
      <div className="flex-1 w-full max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
        <QpaCalculator />
      </div>
      
      <footer className="w-full bg-primary text-white mt-6">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-16">
            <div className="md:max-w-xs space-y-4 text-left">
              <h3 className="font-bold text-xl text-white">CMU QPA Calculator</h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80">
                  Not officially associated with Carnegie Mellon University
                </p>
                <p className="text-sm text-white/60">
                  Copyright © {new Date().getFullYear()}
                </p>
              </div>
            </div>
            <div className="md:max-w-xs space-y-4 text-left">
              <h4 className="font-medium text-white/90 mb-2">Created by</h4>
              <p className="font-medium text-white">Miguel Salvacion</p>
              <div className="flex flex-col space-y-3">
                <a 
                  href="mailto:msalvaci@andrew.cmu.edu" 
                  className="text-white/70 group flex items-center gap-2 p-1 transition-colors duration-200 w-fit hover:text-white text-sm"
                >
                  <Mail className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                  <span>msalvaci@andrew.cmu.edu</span>
                </a>
                <a 
                  href="https://github.com/miguel-salv" 
                  className="text-white/70 group flex items-center gap-2 p-1 transition-colors duration-200 w-fit hover:text-white text-sm"
                >
                  <Github className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                  <span>GitHub Profile</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

