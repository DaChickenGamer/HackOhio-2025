import { Person } from "@/types/person";
 
export const testPerson: Person = {
    headshot: "",
    firstName: "John",
    lastName: "Doe",
    id: "12345",
    education: [
      {
        degree: "B.S. Computer Science",
        school: "Ohio State University",
        year: "2022"
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
      {
        type: "Email",
        value: "john.doe@example.com"
      },
      {
        type: "Phone",
        value: "555-1234"
      }
    ],
    tags: ["Developer", "Full-Stack"],
    notes: "Great team player, loves hackathons!"
  };