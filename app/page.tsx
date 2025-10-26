"use client";

import { useState } from 'react';
import PersonNode from "./components/PersonNode";
import { Person } from "@/types/person";
import Link from "next/link";

export default function Home() {
  const [isPersonVisible, setIsPersonVisible] = useState(true);

  // Create a test person object
  const testPerson: Person = {
    firstName: "John",
    lastName: "Doe",
    id: "12345",
    education: [
      { 
        degree: "B.S. Computer Science",
        school: "Ohio State University",
        year: "2022"
      },
      { 
        degree: "M.S. Artificial Intelligence", 
        school: "Stanford University",
        year: "2024"
      }
    ],
    experience: [
      {
        role: "Software Engineer",
        company: "Tech Corp", 
        duration: "2 years"
      }
    ],
    skills: ["React", "TypeScript", "Node.js"],
    contacts: [
      { type: "Email", value: "john.doe@example.com" },
      { type: "Phone", value: "555-1234" }
    ],
    tags: ["Developer", "Full-Stack"],
    notes: "Great team player, lower headphones!"
  };

  const togglePersonVisibility = () => {
    setIsPersonVisible(!isPersonVisible);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="mt-8">
          {/* Toggle Button */}
          <div className="mb-4 text-center">
            <button
              onClick={togglePersonVisibility}
              className="inline-flex h-10 items-center justify-center rounded-full bg-blue-500 px-6 text-white hover:bg-blue-600 transition-colors"
            >
              {isPersonVisible ? "Hide Profile" : "Show Profile"}
            </button>
          </div>

          {/* Display the PersonNode */}
          {isPersonVisible && (
            <PersonNode 
              person={testPerson} 
              onDelete={() => setIsPersonVisible(false)}
            />
          )}

          <Link
            href="/graph"
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background mt-4"
          >
            See the graph →
          </Link>
        </div>
      </main>
    </div>
  );
}


// "use client";

// import { useEffect } from "react";
// import { testPerson } from "@/data/TestUserCase";


// import Link from "next/link";
// import Image from "next/image";
// import PersonNode from "./components/PersonNode";
// import { Person } from "@/types/person";

// export default function Home() {

//   // Create a test person object
//   const testPerson: Person = {
//     firstName: "John",
//     lastName: "Doe",
//     id: "12345",
//     education: [
//       { 
//         degree: "B.S. Computer Science",
//         school: "Ohio State University",
//         year: "2022"
//       }, {
//         degree: "M.S. Computer Science",
//         school: "Ohio State University",
//         year: "2024"
//       }, {
//         degree: "Ph.D. Computer Science",
//         school: "Ohio State University",
//         year: "2026"
//       }
//     ],
//     experience: [
//       {
//         role: "Software Engineer",
//         company: "Tech Corp",
//         duration: "2 years"
//       }, {
//         role: "Senior Software Engineer",
//         company: "Innovatech",
//         duration: "3 years"
//       }
//     ],
//     skills: ["React", "TypeScript", "Node.js"],
//     contacts: [
//       {
//         type: "Email",
//         value: "john.doe@example.com"
//       },
//       {
//         type: "Phone",
//         value: "555-1234"
//       }
//     ],
//     tags: ["Developer", "Full-Stack"],
//     notes: "Great team player, loves hackathons!"
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         {/* existing content ... */}

//         <div className="mt-8">

//           {/* Display the PersonNode */}
//           <PersonNode person={testPerson} />

//           <Link
//             href="/graph"
//             className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background"
//           >

//             See the graph →
//           </Link>
//         </div>
//       </main>
//     </div>
//   );
// }
