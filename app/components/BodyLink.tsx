import { Link, type To } from 'react-router';
import { cn } from '~/utils';

export type BodyLinkProps = React.PropsWithChildren<{
    to: To
    external?: boolean
    className?: string
}>

export default function BodyLink({ children, to, external, className }: BodyLinkProps) {
    return <Link
        to={to}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cn(
            'underline decoration-blue-500/60 hover:decoration-blue-500 transition-colors duration-200',
            className
        )}>
        {children}
    </Link>
}