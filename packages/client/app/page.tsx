import TopBarStatic from './components/home/topbar/TopBarStatic';
import HeroStatic from './components/home/hero/HeroStatic';

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-r from-red-900/30 to-blue-300 min-h-[400vh]">
        <TopBarStatic />
        <main className="pt-28">
          <HeroStatic />
          <div className="max-w-7xl mx-auto px-4 mt-20"></div>
        </main>
      </div>
    </>
  );
}
