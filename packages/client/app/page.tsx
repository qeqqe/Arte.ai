import TopBar from './components/home/topbar/TopBar';
import Hero from './components/home/hero/Hero';

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-r from-red-900/30 to-blue-300 min-h-[400vh]">
        <TopBar />
        <main className="pt-28">
          <Hero />
          <div className="max-w-7xl mx-auto px-4 mt-20"></div>
        </main>
      </div>
    </>
  );
}
