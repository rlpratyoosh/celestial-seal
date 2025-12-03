"use client";
import { useEffect, useState } from "react";

export default function Home() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const getMessage = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            console.log(response)
            const msg = await response.json();
            setMessage(msg.message);
        };
        getMessage()
    }, []);

    return <>{message}</>;
}
