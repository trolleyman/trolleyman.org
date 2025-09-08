import type { Route } from './+types/leaderboard';
import leaderboardData from '../leaderboard.json';

export async function loader({ }: Route.LoaderArgs) {
    return new Response(JSON.stringify(leaderboardData));
}
