"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";

interface Note {
  name: string;
  frequency: number;
  key: string;
}

type Instrument = "sine" | "square" | "sawtooth" | "triangle";

const MusicalKeyboard: React.FC = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [lastPlayedNote, setLastPlayedNote] = useState<string | null>(null);
  const [octaveShift, setOctaveShift] = useState<number>(0);
  const [instrument, setInstrument] = useState<Instrument>("sine");
  const [volume, setVolume] = useState<number>(0.5);
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setAudioContext(
      new (window.AudioContext || (window as any).webkitAudioContext)()
    );
  }, []);

  const baseNotes: Note[] = [
    { name: "C", frequency: 261.63, key: "a" },
    { name: "C#", frequency: 277.18, key: "w" },
    { name: "D", frequency: 293.66, key: "s" },
    { name: "D#", frequency: 311.13, key: "e" },
    { name: "E", frequency: 329.63, key: "d" },
    { name: "F", frequency: 349.23, key: "f" },
    { name: "F#", frequency: 369.99, key: "t" },
    { name: "G", frequency: 392.0, key: "g" },
    { name: "G#", frequency: 415.3, key: "y" },
    { name: "A", frequency: 440.0, key: "h" },
    { name: "A#", frequency: 466.16, key: "u" },
    { name: "B", frequency: 493.88, key: "j" },
    { name: "C5", frequency: 523.25, key: "k" },
  ];

  const notes: Note[] = baseNotes.map((note) => ({
    ...note,
    frequency: note.frequency * Math.pow(2, octaveShift),
  }));

  const playNote = useCallback(
    (frequency: number, noteName: string) => {
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      oscillator.type = instrument;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);

      setLastPlayedNote(noteName);
      setPressedKeys((prev) => ({ ...prev, [noteName]: true }));
      setTimeout(
        () => setPressedKeys((prev) => ({ ...prev, [noteName]: false })),
        200
      );
    },
    [audioContext, instrument, volume]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const note = notes.find((n) => n.key === event.key.toLowerCase());
      if (note) {
        playNote(note.frequency, note.name);
      }
    },
    [notes, playNote]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen p-4 pt-16 items-center bg-stone-100 overflow-scroll">
      <div className="flex mb-16">
        <img src="/logo.png" alt="Music Pad" />
      </div>

      <div className="mb-12 flex space-x-8">
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Octave Shift
          </label>
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => setOctaveShift((prev) => Math.max(prev - 1, -2))}
            >
              -
            </Button>
            <span className="mx-2">{octaveShift}</span>
            <Button
              variant="ghost"
              onClick={() => setOctaveShift((prev) => Math.min(prev + 1, 2))}
            >
              +
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Instrument
          </label>
          <Select
            value={instrument}
            onValueChange={(value: Instrument) => setInstrument(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select instrument" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sine">Sine</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="sawtooth">Sawtooth</SelectItem>
              <SelectItem value="triangle">Triangle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center w-32">
          <label className="block text-sm font-medium text-stone-700 mb-6">
            Volume
          </label>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
          />
        </div>
      </div>

      <div className="flex mb-4 border-8 rounded-md border-stone-400 bg-stone-400 shadow-lg">
        {notes.map((note) => (
          <div
            key={note.name}
            className={`
                     ${
                       note.name.includes("#")
                         ? "bg-stone-950 text-stone-50"
                         : "bg-stone-50 text-stone-950"
                     }
                     ${
                       note.name.includes("#")
                         ? "w-10 h-32 -mx-5 z-10"
                         : "w-14 h-48"
                     }
                     ${pressedKeys[note.name] ? "transform translate-y-1" : ""}
                     border border-stone-300 flex flex-col items-center justify-center pb-2 rounded-b-sm cursor-pointer
                     transition-all duration-100 ease-in-out
                   `}
            onClick={() => playNote(note.frequency, note.name)}
          >
            <div className="h-full flex flex-col mt-2 justify-between items-center">
              <span className="text-xs font-mono">{note.key}</span>
              <span className="text-center text-sm font-semibold">
                {note.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lastPlayedNote && (
        <div className="mt-4">
          <p className="text-stone-800">Last played note: {lastPlayedNote}</p>
        </div>
      )}
    </div>
  );
};

export default MusicalKeyboard;
