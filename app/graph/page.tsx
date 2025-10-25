"use client";

import { ReactFlow, Background, Controls, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Node} from "@xyflow/react";

const intialNodes: Node[] = [
  { id: "1", position: { x: 300, y: 150 }, data: { label: "Node 1" }, type: "default" },
  { id: "2", position: { x: 600, y: 150 }, data: { label: "Node 2" } , type: "default" },
];

export default function GraphPage() {
  return (
    <main className="min-h-screen w-full justify-center py-0 bg-white dark:bg-black">
        <div className="flex h-[100vh]">
            <aside className="w-72 shrink-0 border-r p-3 h-full flex flex-col">
                <h1 className="mb-4 text-2xl font-bold text-black dark:text-white">Search</h1>
                
                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">Education</h3>
                <input
                    type="text"
                    placeholder="Words"
                    className="w-full rounded-lg border px-3 py-2 mb-3 text-black placeholder-gray-400 dark:text-white dark:placeholder-gray-500 bg-white dark:bg-black"
                />


                <button className="mb-4 w-full rounded-lg bg-foreground px-3 py-2 text-background">Search</button>
                
                <div className="pb-3 py-5"/>
                <div className="overflow-y-auto"> 
                    <h1 className="mb-4 text-2xl font-bold text-black dark:text-white">Add Node</h1>
                    <input
                        type="text"
                        placeholder="Node name"
                        className="w-full rounded-lg border px-3 py-2 mb-3 text-black placeholder-gray-400 dark:text-white dark:placeholder-gray-500 bg-white dark:bg-black"
                    />
                    <button className="mb-4 w-full rounded-lg bg-foreground px-3 py-2 text-background">Add Node</button>
                </div>
            </aside>

            

            <section className="flex-1">
                <ReactFlow nodes={intialNodes}>
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </section>
        </div>
    </main>
  );    
}