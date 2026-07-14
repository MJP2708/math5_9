import { SiteNav } from "./components/SiteNav";
import { useHashRoute } from "./lib/useHashRoute";
import { CalculatorPage } from "./pages/CalculatorPage";
import { MathLogicPage } from "./pages/MathLogicPage";
import { DevStoryPage } from "./pages/DevStoryPage";

function App() {
  const route = useHashRoute();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              เลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนตรรกยะ
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              สำรวจค่า a<sup>m/n</sup> แบบอินเทอร์แอกทีฟ พร้อมกราฟและขั้นตอนการคำนวณแบบละเอียด
            </p>
          </div>
          <SiteNav active={route} />
        </header>

        {route === "home" && <CalculatorPage />}
        {route === "math-logic" && <MathLogicPage />}
        {route === "dev-story" && <DevStoryPage />}
      </div>
    </div>
  );
}

export default App;
