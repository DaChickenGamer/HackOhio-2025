"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex justify-end items-center bg-white shadow-md px-6 py-3 relative">
      <div className="flex items-center space-x-2">
        <h1 className="text-sm font-medium text-gray-700">More Options</h1>

        {/* Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col justify-between w-6 h-5 focus:outline-none"
        >
          <span
            className={`block w-full h-0.5 bg-gray-700 transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-full h-0.5 bg-gray-700 transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-full h-0.5 bg-gray-700 transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Dropdown Menu */}
      <div
        ref={menuRef}
        className={`absolute right-6 top-14 bg-white shadow-lg rounded-lg py-2 w-40 transition-all duration-300 origin-top-right ${
          menuOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <button
          onClick={() => {
            setMenuOpen(false);
            router.push("/settings");
          }}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Settings
        </button>

      </div>
    </nav>
  );
}
