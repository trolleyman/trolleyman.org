import { Link, type To } from 'react-router';
import { cn } from '~/utils';

export type BodyLinkProps = React.PropsWithChildren<{
    to: To
    target?: string
    external?: boolean
    className?: string
}>

export default function BodyLink({ children, to, target, external, className }: BodyLinkProps) {
    target ??= external ? '_blank' : undefined;
    return <Link
        to={to}
        target={target}
        rel={external ? "noopener noreferrer" : undefined}
        className={cn(
            'underline decoration-blue-500/60 hover:decoration-blue-500 transition-colors duration-200',
            className
        )}>
        {children}
    </Link>
}