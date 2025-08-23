import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to the home page!" },
  ];
}

export default function Home() {
  return <>
    <h1>Home</h1>
    <div>Hi there!</div>
  </>;
}
