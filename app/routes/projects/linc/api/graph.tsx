import type { Route } from './+types/graph';
import graphData from './graph.json';

export async function loader({}: Route.LoaderArgs) {
  return Response.json(graphData);
}
