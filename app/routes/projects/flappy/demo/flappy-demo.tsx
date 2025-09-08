
import './game.css'

import './.client/game.ts'
import appleTouchIcon from './favicon/apple-touch-icon.png'
import favicon32 from './favicon/favicon-32x32.png'
import favicon16 from './favicon/favicon-16x16.png'
// import manifest from './favicon/manifest.json'
import safariPinnedTab from './favicon/safari-pinned-tab.svg'

export default function FlappyDemo() {
    return <>
        <title>Flappy Clone - trolleyman.org</title>
        {/* Icon stuff. Generated using http://realfavicongenerator.net */}
        <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
        <link rel="icon" type="image/png" href={favicon32} sizes="32x32" />
        <link rel="icon" type="image/png" href={favicon16} sizes="16x16" />
        {/* <link rel="manifest" href={manifest} /> */}
        <link rel="mask-icon" href={safariPinnedTab} color="#5bbad5" />
        <meta name="theme-color" content="#ffffff" />

        {/* Resizes viewport to look good on mobile */}
        <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height" />
        <meta name="HandheldFriendly" content="true" />

        {/* Debug flag */}
        {import.meta.env.DEV && (
            <>
                <meta name="debug" content="1" />
                <script>"use strict";</script>
            </>
        )}

        <div id="header">
            <a id="header-logo" href="..">trolleyman.org</a>
        </div>
        <div id="content">
            <div id="game-container">
                <div id="stats-container" style={{ visibility: 'hidden' }}><div id="stats"></div></div>
                <input id="username-entry" style={{ visibility: 'hidden' }} type="text" />
                <canvas id="canvas" width="500" height="800"></canvas>
            </div>
        </div>
    </>
}
