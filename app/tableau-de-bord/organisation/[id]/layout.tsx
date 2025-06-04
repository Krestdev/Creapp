import React from "react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    
    const { id } = await params

    return {
        title: `Modifier le service ${id}`,
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>{children}</div>
    )
}