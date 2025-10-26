import type { Node } from "@xyflow/react";

export type PersonData = {
  id: string;
  firstName: string;
  lastName: string;
  education?: Array<{ degree: string; school: string; year: string }>;
  experience?: Array<{ role: string; company: string; duration: string }>;
  skills?: string[];
  contacts?: Array<{ type: string; value: string }>;
  tags?: string[];
  notes?: string;
  label?: string;
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