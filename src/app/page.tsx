"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

// Dynamically import the visualizer to avoid SSR issues with WebGL
const MusicVisualizer = dynamic(() => import("@/components/MusicVisualizer"), {
  ssr: false,
});

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen bg-white dark:bg-black">
      <Navbar
        onMenuClick={() => setIsSidebarOpen(true)}
        onBackClick={() => setIsSidebarOpen(false)}
        isSidebarOpen={isSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="pt-16 bg-white dark:bg-black z-10 relative">
        {/* Content goes here */}
      </div>
      {/* Place visualizer with lower z-index so it doesn't block background */}
      <div className="z-0">
        <MusicVisualizer />
      </div>
    </div>
  );
}
