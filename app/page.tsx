"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      {/* ====== Fade-in black overlay ====== */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 bg-black z-50 pointer-events-none"
      />

      <main className="flex flex-col items-center justify-center text-center px-8 py-16 max-w-3xl space-y-10 relative z-10">
        {/* ====== Animated Company Name ====== */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 0.3,
          }}
          className="text-6xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600 drop-shadow-lg"
        >
          WebConnect
        </motion.h1>

        {/* ====== Delayed Content ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <Image
              src="/clogo.png"
              alt="WebConnect Logo"
              width={300}
              height={10}
              className="dark:invert"
            />
          </motion.div>

          {/* Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.7 }}
            className="text-3xl font-semibold"
          >
            Visualize Connections Effortlessly
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
            className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl"
          >
            Explore relationships, structures, and data in an interactive and
            intuitive way. WebConnect brings your ideas to life through dynamic
            visual connections.
          </motion.p>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.7 }}
          >
            <Link
              href="/graph"
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-white text-lg font-medium hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md"
            >
              See the Graph →
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1 }}
          className="text-sm text-zinc-500 dark:text-zinc-500 mt-8"
        >
          © {new Date().getFullYear()} WebConnect. Built with Next.js & AWS DynamoDB.
        </motion.footer>
      </main>

      {/* ====== Keyframes for shifting gradient ====== */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradientShift 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
