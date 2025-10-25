import { Contact } from "./contact";
import { Experience } from "./experience";
import { Education } from "./education";

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

