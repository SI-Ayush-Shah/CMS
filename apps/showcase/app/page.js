import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen p-10 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <h1 className="text-h1 leading-h1 font-bold text-main-high">Showcase</h1>
        <a href="/components" className="text-core-prim-500 hover:text-core-prim-600 underline underline-offset-4">Components →</a>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-default p-6 bg-surface">
          <h2 className="text-h2 leading-h2 font-medium mb-2">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="solid" className="font-bold">Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-default p-6 bg-surface">
          <h2 className="text-h2 leading-h2 font-medium mb-2">Inputs</h2>
          <div className="flex flex-col gap-3 max-w-md">
            <input className="w-full rounded px-3 py-2 border border-default text-main-high placeholder:text-main-low" placeholder="Placeholder" />
            <select className="w-full rounded px-3 py-2 border border-default text-main-high">
              <option>Option A</option>
              <option>Option B</option>
            </select>
            <textarea className="w-full rounded px-3 py-2 border border-default text-main-high" rows={3} placeholder="Textarea" />
          </div>
        </section>
      </main>
    </div>
  );
}
