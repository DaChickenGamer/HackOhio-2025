"use client";

import { useEffect } from "react";
import { testPerson } from "@/data/TestUserCase";
import { Person } from "@/types/person";

export default function Home() {
    async function addConnection(data: Person) {
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const text = await res.text(); 

        if (!res.ok) {
            console.error("Response status:", res.status);
            console.error("Response body:", text); 
            throw new Error(`Failed to add connection: ${res.status} ${text}`);
        }

        try {
            return JSON.parse(text);
        } catch {
            return text; 
        }
    }

    useEffect(() => {
        addConnection(testPerson)
            .then(console.log)
            .catch(console.error);
    }, []);

    return <div>Home Page</div>;
}
