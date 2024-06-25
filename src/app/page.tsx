import dynamic from "next/dynamic";
import React from "react";

const MusicalKeyboardClient = dynamic(
  () => import("../components/MusicalKeyboard"),
  { ssr: false }
);

const LoadingPlaceholder = () => (
  <div className="flex justify-center items-center h-screen">
    <p>Loading Musical Keyboard...</p>
  </div>
);

export default function Home() {
  return (
    <main className="bg-stone-50">
      <MusicalKeyboardClient />
    </main>
  );
}
