import type { Route } from "./+types/MainLayout";
import { Outlet } from 'react-router';
import ErrorContent from "~/components/ErrorContent";

export default function MainErrorLayout() {
    return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return <ErrorContent error={error} />
}
