import { Outlet } from 'react-router';

import { dotMinIfDebug } from '~/utils';
import path from 'path';
import fs from 'fs/promises';

import './main.css'
import './main-mod.css'

export async function loader({ }: Route.LoaderArgs) {
  const subDir = 'static/img/bg'
  const imgDir = path.resolve('public', subDir);
  var bgFiles = (await fs.readdir(imgDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.match(/\d\d\.(jpg)$/i))
    .map((entry) => path.join(subDir, entry.name).replaceAll(/\\/g, '/'));
  return {
    bgFiles,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* <!-- Chrome, Firefox OS and Opera --> */}
      <meta name="theme-color" content="#2e3141" />
      {/* <!-- Windows Phone --> */}
      <meta name="msapplication-navbutton-color" content="#2e3141" />

      <link rel="stylesheet" href={`https://unpkg.com/font-awesome@4.6.3/css/font-awesome${dotMinIfDebug}.css`} />

      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway:200,700|Source+Sans+Pro:300,600,300italic,600italic" />

      <link rel="stylesheet" href="/static/css/main.css" />
      <link rel="stylesheet" href="/static/css/main-mod.css" />

      {children}
    </>
  );
}

export default function Main() {
  return <Outlet />;
}
