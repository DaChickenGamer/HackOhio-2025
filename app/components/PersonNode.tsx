import { Person } from "@/types/person";

// Props interface
interface PersonNodeProps {
  person: Person;
}

export default function PersonNode({ person }: PersonNodeProps) {
  return (
    <div className="person-node max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200 aspect-square min-h-0">
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
        {/* Left Column */}
        <div className="space-y-4 overflow-y-auto">
          {/* Experience */}
          <div className="node-experience">
            <strong className="block text-sm mb-1">Experience</strong>
            {person.experience && person.experience.length > 0 ? (
              person.experience.slice(0, 2).map((exp, index) => (
                <div key={index} className="mb-2 text-xs">
                  <p className="font-medium">{exp.role}</p>
                  <p className="text-gray-600">{exp.company}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-xs">None</p>
            )}
          </div>

          {/* Education */}
          <div className="node-education">
            <strong className="block text-sm mb-1">Education</strong>
            {person.education && person.education.length > 0 ? (
              person.education.slice(0, 2).map((edu, index) => (
                <div key={index} className="mb-2 text-xs">
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-gray-600">{edu.school}</p>
                </div>
              ))
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
                {person.skills.slice(0, 4).map((skill, index) => (
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
                {person.contacts.slice(0, 2).map((contact, index) => (
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
                {person.tags.slice(0, 3).map((tag, index) => (
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
  );
}

// PersonNode component
// export default function PersonNode({ person }: PersonNodeProps) {
//   return (
//     <div className="person-node max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
//       {/* Header with name and profile */}
//       <div className="node-header flex items-center gap-4 mb-4">
//         <div className="profile-image w-16 h-16 bg-gray-300 rounded-full" />
//         <div className="node-title">
//           {/* Headshot */}
//           {person.headshot ? <div><p className="current-headShot text-gray-600">{person.headshot}</p></div> : "None"}

//           {/* FirstName */}
//           {person.firstName ? <div><p className="current-first text-gray-600">{person.firstName}</p></div> : "None"}

//           {/* LastName */}
//           {person.lastName ? <div><p className="current-last text-gray-600">{person.lastName}</p></div> : "None"}

//         </div>
//       </div>

//       {/* Experience Section */}
//       <div className="node-experience mb-4">
//         <strong className="block text-lg mb-2">Experience</strong>
//         {person.experience && person.experience.length > 0 ? (
//           person.experience.map((exp, index) => (
//             <div key={index} className="mb-3 pl-4 border-l-2 border-gray-300">
//               <p><strong>Role:</strong> {exp.role}</p>
//               <p><strong>Company:</strong> {exp.company}</p>
//               {exp.duration && <p><strong>Duration:</strong> {exp.duration}</p>}
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500 italic">None</p>
//         )}
//       </div>

//       {/* Education Section */}
//       <div className="node-education mb-4">
//         <strong className="block text-lg mb-2">Education</strong>
//         {person.education && person.education.length > 0 ? (
//           person.education.map((edu, index) => (
//             <div key={index} className="mb-3 pl-4 border-l-2 border-gray-300">
//               <p><strong>Degree:</strong> {edu.degree}</p>
//               <p><strong>School:</strong> {edu.school}</p>
//               <p><strong>Year:</strong> {edu.year}</p>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500 italic">None</p>
//         )}
//       </div>

//       {/* Skills Section */}
//       <div className="node-skills mb-4">
//         <strong className="block text-lg mb-2">Skills</strong>
//         {person.skills && person.skills.length > 0 ? (
//           <div className="flex flex-wrap gap-2">
//             {person.skills.map((skill, index) => (
//               <span 
//                 key={index} 
//                 className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
//               >
//                 {skill}
//               </span>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500 italic">None</p>
//         )}
//       </div>

//       {/* Contact Section */}
//       <div className="node-contact mb-4">
//         <strong className="block text-lg mb-2">Contact</strong>
//         {person.contacts && person.contacts.length > 0 ? (
//           <div className="space-y-1">
//             {person.contacts.map((contact, index) => (
//               <div key={index} className="mb-2">
//                 <p><strong>{contact.type}:</strong> {contact.value}</p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500 italic">None</p>
//         )}
//       </div>

//       {/* Tags Section */}
//       <div className="node-tags mb-4">
//         <strong className="block text-lg mb-2">Tags</strong>
//         {person.tags && person.tags.length > 0 ? (
//           <div className="flex flex-wrap gap-2">
//             {person.tags.map((tag, index) => (
//               <span 
//                 key={index} 
//                 className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500 italic">None</p>
//         )}
//       </div>

//       {/* Notes Section */}
//       <div className="node-notes">
//         <strong className="block text-lg mb-2">Notes</strong>
//         {person.notes ? (
//           <p className="current-notes text-gray-600">{person.notes}</p>
//         ) : (
//           <p className="text-gray-500 italic">None</p>
//         )}
//       </div>
//     </div>
//   );
