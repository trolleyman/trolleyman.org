import { Link, type To } from 'react-router';
import type { ReactNode } from 'react';

export type FancyLinkProps = {
    children?: string | ReactNode
    to: To
    external?: boolean
}

export default function FancyLink({ children, to, external }: FancyLinkProps) {
    return <Link
        to={to}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="m-1 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
        {children}
    </Link>
}