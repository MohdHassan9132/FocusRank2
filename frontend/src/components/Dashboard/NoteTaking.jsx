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
    <div className="bg-white dark:bg-black transition-colors duration-300">
      <div className="w-full">
        <h1 className="text-4xl font-bold mb-3 text-center text-gray-900 dark:text-white">
          Smart Note Taking
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12 text-center max-w-md mx-auto">
          Use the right tool at the right time to improve learning efficiency.
        </p>

        <div className="grid gap-6 md:grid-cols-3 w-full">
          {tools.map((tool, index) => (
            <a
              key={index}
              href={tool.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-zinc-950 rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-zinc-800 transition-colors">
                  <span className="text-gray-900 dark:text-white">{tool.icon}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {tool.name}
                  </h2>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {tool.category}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {tool.desc}
              </p>

              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                Tip: {tool.when}
              </p>

              <span className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                Open Tool <ExternalLink size={16} />
              </span>
            </a>
          ))}
        </div>

        <div className="mt-16 max-w-xl mx-auto text-center rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all p-8">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
            Recommended Study Flow
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Learn {"->"} Visualize (Excalidraw) {"->"} Organize (Eraser) {"->"} Revise (Notion)
          </p>
        </div>

        <div className="mt-8 text-center max-w-lg mx-auto">
          <div className="bg-blue-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4">
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              Pro tip: Students who visualize and structure notes retain concepts
              longer than passive reading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
