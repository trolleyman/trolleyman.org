import { useEffect, useRef } from 'react';

import { Game } from './.client/game.ts';

import './game.css';

import appleTouchIcon from './favicon/apple-touch-icon.png';
import favicon16 from './favicon/favicon-16x16.png';
import favicon32 from './favicon/favicon-32x32.png';
import safariPinnedTab from './favicon/safari-pinned-tab.svg';

// import manifest from './favicon/manifest.json'

export default function FlappyDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const usernameEntryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      canvasRef.current &&
      statsContainerRef.current &&
      statsRef.current &&
      usernameEntryRef.current
    ) {
      const game = new Game(
        canvasRef.current,
        statsContainerRef.current,
        statsRef.current,
        usernameEntryRef.current,
      );
      window.requestAnimationFrame(game.mainLoop.bind(game));
      return game.dispose.bind(game);
    }
  }, []);

  return (
    <>
      <title>Flappy Clone - trolleyman.org</title>
      {/* Icon stuff. Generated using http://realfavicongenerator.net */}
      <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
      <link rel="icon" type="image/png" href={favicon32} sizes="32x32" />
      <link rel="icon" type="image/png" href={favicon16} sizes="16x16" />
      {/* <link rel="manifest" href={manifest} /> */}
      <link rel="mask-icon" href={safariPinnedTab} color="#5bbad5" />
      <meta name="theme-color" content="#ffffff" />

      {/* Resizes viewport to look good on mobile */}
      <meta
        name="viewport"
        content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height"
      />
      <meta name="HandheldFriendly" content="true" />

      <div className="h-svh w-svw">
        <div
          className="absolute right-0 z-[1] m-[7px]"
          style={{ visibility: 'hidden' }}
          ref={statsContainerRef}
        >
          <div
            ref={statsRef}
            className="min-w-[120px] bg-black/70 p-[7px] font-[arial]
              leading-[1.2] text-white"
          ></div>
        </div>
        <input
          className="font-flappy text-gold focus:border-gold absolute z-[2] m-0
            size-7 border-[1.5px] border-black bg-transparent p-[2px] text-right
            caret-black
            text-shadow-[2px_2px_0px_black,-2px_2px_0px_black,2px_-2px_0px_black,-2px_-2px_0px_black]"
          style={{
            visibility: 'hidden',
          }}
          type="text"
          ref={usernameEntryRef}
        />
        <canvas className="h-svh w-svw" ref={canvasRef} />
      </div>
    </>
  );
}
