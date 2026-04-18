import React from "react";
import { ExternalLink, PencilRuler, BookOpen } from "lucide-react";

export default function NoteTaking() {
  const tools = [
    {
      name: "Excalidraw",
      category: "Visual Thinking",
      desc: "Sketch diagrams, flowcharts & ideas visually",
      when: "Use when you're stuck or need visual clarity",
      link: "https://excalidraw.com/",
      icon: <PencilRuler size={28} />,
    },
    {
      name: "Eraser",
      category: "Structured Notes",
      desc: "Create clean, structured notes & docs",
      when: "Use after studying to organize concepts",
      link: "https://app.eraser.io/all",
      icon: <ExternalLink size={28} />,
    },
    {
      name: "Notion",
      category: "Deep Study",
      desc: "All-in-one workspace for notes & revision",
      when: "Use for long-term revision & tracking",
      link: "https://www.notion.so/",
      icon: <BookOpen size={28} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10">
      
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-2 text-center">
        Smart Note Taking
      </h1>
      <p className="text-gray-400 mb-10 text-center max-w-md">
        Don’t just write notes — use the right tools at the right time to improve learning efficiency.
      </p>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl">
        {tools.map((tool, index) => (
          <a
            key={index}
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 hover:bg-gray-800 transition-all border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-lg hover:scale-[1.03]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-xl">
                {tool.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{tool.name}</h2>
                <p className="text-xs text-blue-400">{tool.category}</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              {tool.desc}
            </p>

            <p className="text-xs text-gray-500 italic">
              💡 {tool.when}
            </p>

            <span className="text-blue-400 text-sm flex items-center gap-1">
              Open Tool <ExternalLink size={16} />
            </span>
          </a>
        ))}
      </div>

      {/* Study Flow Section */}
      <div className="mt-14 max-w-xl text-center">
        <h2 className="text-xl font-semibold mb-3">Recommended Study Flow</h2>
        <p className="text-gray-400 text-sm">
          Learn → Visualize (Excalidraw) → Organize (Eraser) → Revise (Notion)
        </p>
      </div>

      {/* Pro Tip */}
      <div className="mt-6 text-center text-gray-500 max-w-lg text-sm">
        💡 Pro Tip: Students who visualize + structure notes retain concepts much longer than passive reading.
      </div>

    </div>
  );
}