"use client";

import { Person } from "@/types/person";

import { useState } from 'react';

// Props interface
interface PersonNodeProps {
  person: Person;
}

// PersonNode component
export default function PersonNode({ person }: PersonNodeProps) {
  const [expPage, setExpPage] = useState(0);
  const [eduPage, setEduPage] = useState(0);

  const expPages = person.experience || [];
  const eduPages = person.education || [];

  const maxExpPages = Math.max(expPages.length, 1);
  const maxEduPages = Math.max(eduPages.length, 1);

  const currentExp = expPages[expPage];
  const currentEdu = eduPages[eduPage];

  const nextExp = () => setExpPage((prev: number) => (prev + 1) % maxExpPages);
  const prevExp = () => setExpPage((prev: number) => (prev - 1 + maxExpPages) % maxExpPages);
  
  const nextEdu = () => setEduPage((prev: number) => (prev + 1) % maxEduPages);
  const prevEdu = () => setEduPage((prev: number) => (prev - 1 + maxEduPages) % maxEduPages);

  return (
    <div className="person-node fixed inset-0 flex items-center justify-center z-50">
      {/*<div className="absolute inset-0 bg-black bg-opacity-50"></div>*/}
      
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 aspect-square min-h-0 mx-4">
        {/* Name Header */}
        <div className="node-header text-center mb-6">
          <h2 className="text-xl font-bold">
            {person.firstName || person.lastName ? (
              `${person.firstName || ''} ${person.lastName || ''}`.trim()
            ) : (
              "Unnamed Person"
            )}
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 h-[calc(100%-3rem)]">
          {/* Left Column - Experience Book */}
          <div className="space-y-4">
            <div className="node-experience">
              <div className="flex items-center justify-between mb-1">
                <strong className="block text-sm">Experience</strong>
                {expPages.length > 1 && (
                  <div className="flex items-center gap-1 text-xs">
                    {expPage > 0 && (
                      <button 
                        onClick={prevExp}
                        className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                      >
                        ←
                      </button>
                    )}
                    <span>{expPage + 1}/{maxExpPages}</span>
                    {expPage < maxExpPages - 1 && (
                      <button 
                        onClick={nextExp}
                        className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                      >
                        →
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {currentExp ? (
                <div className="text-xs border rounded-lg p-3 bg-gray-50 min-h-[80px]">
                  <p className="font-medium mb-1">{currentExp.role}</p>
                  <p className="text-gray-600 mb-1">{currentExp.company}</p>
                  {currentExp.duration && (
                    <p className="text-gray-500 text-xs">{currentExp.duration}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic text-xs">None</p>
              )}
            </div>

            {/* Education Book */}
            <div className="node-education">
              <div className="flex items-center justify-between mb-1">
                <strong className="block text-sm">Education</strong>
                {eduPages.length > 1 && (
                  <div className="flex items-center gap-1 text-xs">
                    {eduPage > 0 && (
                      <button 
                        onClick={prevEdu}
                        className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                      >
                        ←
                      </button>
                    )}
                    <span>{eduPage + 1}/{maxEduPages}</span>
                    {eduPage < maxEduPages - 1 && (
                      <button 
                        onClick={nextEdu}
                        className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                      >
                        →
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {currentEdu ? (
                <div className="text-xs border rounded-lg p-3 bg-gray-50 min-h-[80px]">
                  <p className="font-medium mb-1">{currentEdu.degree}</p>
                  <p className="text-gray-600 mb-1">{currentEdu.school}</p>
                  <p className="text-gray-500">{currentEdu.year}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic text-xs">None</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 overflow-y-auto">
            {/* Skills */}
            <div className="node-skills">
              <strong className="block text-sm mb-1">Skills</strong>
              {person.skills && person.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {person.skills.slice(0, 6).map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-xs">None</p>
              )}
            </div>

            {/* Contact */}
            <div className="node-contact">
              <strong className="block text-sm mb-1">Contact</strong>
              {person.contacts && person.contacts.length > 0 ? (
                <div className="space-y-1 text-xs">
                  {person.contacts.slice(0, 3).map((contact, index) => (
                    <div key={index}>
                      <p><span className="font-medium">{contact.type}:</span> {contact.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-xs">None</p>
              )}
            </div>

            {/* Tags */}
            <div className="node-tags">
              <strong className="block text-sm mb-1">Tags</strong>
              {person.tags && person.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {person.tags.slice(0, 4).map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-xs">None</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes - Full width at bottom */}
        <div className="node-notes mt-4 border-t pt-2">
          <strong className="block text-sm mb-1">Notes</strong>
          {person.notes ? (
            <p className="text-gray-600 text-xs line-clamp-2">{person.notes}</p>
          ) : (
            <p className="text-gray-500 italic text-xs">None</p>
          )}
        </div>
      </div>
    </div>
  );
}



// // PersonNode component
// export default function PersonNode({ person }: PersonNodeProps) {
//   const [expPage, setExpPage] = useState(0);
//   const [eduPage, setEduPage] = useState(0);

//   const expPages = person.experience || [];
//   const eduPages = person.education || [];

//   const maxExpPages = Math.max(expPages.length, 1);
//   const maxEduPages = Math.max(eduPages.length, 1);

//   const currentExp = expPages[expPage];
//   const currentEdu = eduPages[eduPage];

//   const nextExp = () => setExpPage((prev: number) => (prev + 1) % maxExpPages);
//   const prevExp = () => setExpPage((prev: number) => (prev - 1 + maxExpPages) % maxExpPages);
  
//   const nextEdu = () => setEduPage((prev: number) => (prev + 1) % maxEduPages);
//   const prevEdu = () => setEduPage((prev: number) => (prev - 1 + maxEduPages) % maxEduPages);

//   return (
//     <div className="person-node max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200 aspect-square min-h-0">
//       {/* Name Header */}
//       <div className="node-header text-center mb-6">
//         <h2 className="text-xl font-bold">
//           {person.firstName || person.lastName ? (
//             `${person.firstName || ''} ${person.lastName || ''}`.trim()
//           ) : (
//             "Unnamed Person"
//           )}
//         </h2>
//       </div>

//       {/* Two Column Layout */}
//       <div className="grid grid-cols-2 gap-6 h-[calc(100%-3rem)]">
//         {/* Left Column - Experience Book */}
//         <div className="space-y-4">
//           <div className="node-experience">
//             <div className="flex items-center justify-between mb-1">
//               <strong className="block text-sm">Experience</strong>
//               {expPages.length > 1 && (
//                 <div className="flex items-center gap-1 text-xs">
//                   {/* Show previous button only if NOT on first page */}
//                   {expPage > 0 && (
//                     <button 
//                       onClick={prevExp}
//                       className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
//                     >
//                       ←
//                     </button>
//                   )}
//                   <span>{expPage + 1}/{maxExpPages}</span>
//                   {/* Show next button only if NOT on last page */}
//                   {expPage < maxExpPages - 1 && (
//                     <button 
//                       onClick={nextExp}
//                       className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
//                     >
//                       →
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
            
//             {currentExp ? (
//               <div className="text-xs border rounded-lg p-3 bg-gray-50 min-h-[80px]">
//                 <p className="font-medium mb-1">{currentExp.role}</p>
//                 <p className="text-gray-600 mb-1">{currentExp.company}</p>
//                 {currentExp.duration && (
//                   <p className="text-gray-500 text-xs">{currentExp.duration}</p>
//                 )}
//               </div>
//             ) : (
//               <p className="text-gray-500 italic text-xs">None</p>
//             )}
//           </div>

//           {/* Education Book */}
//           <div className="node-education">
//             <div className="flex items-center justify-between mb-1">
//               <strong className="block text-sm">Education</strong>
//               {eduPages.length > 1 && (
//                 <div className="flex items-center gap-1 text-xs">
//                   {/* Show previous button only if NOT on first page */}
//                   {eduPage > 0 && (
//                     <button 
//                       onClick={prevEdu}
//                       className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
//                     >
//                       ←
//                     </button>
//                   )}
//                   <span>{eduPage + 1}/{maxEduPages}</span>
//                   {/* Show next button only if NOT on last page */}
//                   {eduPage < maxEduPages - 1 && (
//                     <button 
//                       onClick={nextEdu}
//                       className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
//                     >
//                       →
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
            
//             {currentEdu ? (
//               <div className="text-xs border rounded-lg p-3 bg-gray-50 min-h-[80px]">
//                 <p className="font-medium mb-1">{currentEdu.degree}</p>
//                 <p className="text-gray-600 mb-1">{currentEdu.school}</p>
//                 <p className="text-gray-500">{currentEdu.year}</p>
//               </div>
//             ) : (
//               <p className="text-gray-500 italic text-xs">None</p>
//             )}
//           </div>
//         </div>

//         {/* Right Column */}
//         <div className="space-y-4 overflow-y-auto">
//           {/* Skills */}
//           <div className="node-skills">
//             <strong className="block text-sm mb-1">Skills</strong>
//             {person.skills && person.skills.length > 0 ? (
//               <div className="flex flex-wrap gap-1">
//                 {person.skills.slice(0, 6).map((skill, index) => (
//                   <span 
//                     key={index} 
//                     className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 italic text-xs">None</p>
//             )}
//           </div>

//           {/* Contact */}
//           <div className="node-contact">
//             <strong className="block text-sm mb-1">Contact</strong>
//             {person.contacts && person.contacts.length > 0 ? (
//               <div className="space-y-1 text-xs">
//                 {person.contacts.slice(0, 3).map((contact, index) => (
//                   <div key={index}>
//                     <p><span className="font-medium">{contact.type}:</span> {contact.value}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 italic text-xs">None</p>
//             )}
//           </div>

//           {/* Tags */}
//           <div className="node-tags">
//             <strong className="block text-sm mb-1">Tags</strong>
//             {person.tags && person.tags.length > 0 ? (
//               <div className="flex flex-wrap gap-1">
//                 {person.tags.slice(0, 4).map((tag, index) => (
//                   <span 
//                     key={index} 
//                     className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 italic text-xs">None</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Notes - Full width at bottom */}
//       <div className="node-notes mt-4 border-t pt-2">
//         <strong className="block text-sm mb-1">Notes</strong>
//         {person.notes ? (
//           <p className="text-gray-600 text-xs line-clamp-2">{person.notes}</p>
//         ) : (
//           <p className="text-gray-500 italic text-xs">None</p>
//         )}
//       </div>
//     </div>
//   );
// }
