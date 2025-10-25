import { Contact } from "./contact";
import { Experience } from "./education";
import { Education } from "./experience";

export interface Person {
  headshot: string;
  firstName: string;
  lastName?: string;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  contacts?: Contact[];
  tags?: string[];
  notes?: string;

}

