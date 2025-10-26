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

  distance?: number;
  maxDistance?: number;
};

export type PersonNode = Node<PersonData, "person">;