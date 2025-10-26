import type { Node } from "@xyflow/react";
import type { Education } from "@/types/education";
import type { Experience } from "@/types/experience";
import type { Contact } from "@/types/contact";

export type PersonData = {
  id: string;
  firstName?: string;
  lastName?: string;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  contacts?: Contact[];
  tags?: string[];
  notes?: string;
  label?: string;
  headshot?: string;
  parentId?: string;
};

export type PersonNode = Node<PersonData, "person">;

export type FormData = {
  firstName: string;
  lastName: string;
  degree: string;
  school: string;
  year: string;
  educations: Array<{ degree: string; school: string; year: string }>;
  role: string;
  company: string;
  duration: string;
  experiences: Array<{ role: string; company: string; duration: string }>;
  skills: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  tags: string;
  notes: string;
};