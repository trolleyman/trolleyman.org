import type { Route } from "./+types/MainLayout";
import { Outlet } from 'react-router';
import MainLayoutErrorPage from "~/components/MainLayoutErrorPage";
import MainLayoutChildren from '~/layouts/MainLayoutChildren';

export default function MainLayout() {
    return <MainLayoutChildren>
        <Outlet />
    </MainLayoutChildren>
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return <MainLayoutErrorPage error={error} />
}
