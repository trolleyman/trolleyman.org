import type { Route } from "./+types/_main._index";
import { fullName } from "~/data/info";

export function meta({}: Route.MetaArgs) {
  return [
    // { title: `${fullName}` },
    { name: "description", content: "Welcome to the home page!" },
  ];
}

export default function Home() {
  return <>
    <h1>Home</h1>
    <div>Hi there!</div>
  </>;
}
