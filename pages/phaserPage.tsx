import PhaserComponent from "@/components/phaser/phaserComponent";
import dynamic from "next/dynamic";
import React from "react";

const PhaserComponentWithoutSSR = dynamic(
  () => import("@/components/phaser/phaserComponent"),
  {
    ssr: false
  }
);

export default function Index(props: {}) {
  return (
    // <React.StrictMode>
    <PhaserComponentWithoutSSR />
    // </React.StrictMode>
  );
}
