import { data } from 'react-router';

export function loader() {
  throw data('Page Not Found', { status: 404 });
}

export default function CatchAll() {
  return <div>Page Not Found</div>;
}
