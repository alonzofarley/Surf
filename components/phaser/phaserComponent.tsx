import Head from "next/head";
import { useEffect, useMemo } from "react";
import { Example } from "./exampleScene";

export default function PhaserComponent(props: {}) {
  useEffect(() => {
    let initPhaser = async () => {
      const Phaser = await import("phaser");

      console.log(Phaser);
      const phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: Example,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 200, x: 0 }
          }
        }
      });
    };
    initPhaser();
  }, []);

  return (
    <div>
      <HeadComponent />
    </div>
  );
}

function HeadComponent() {
  return (
    <Head>
      <title>{"test name"}</title>
      <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser-arcade-physics.min.js"></script>
    </Head>
  );
}
