import { getReasonPhrase } from 'http-status-codes';
import { isRouteErrorResponse } from 'react-router';

function getStatusText(status: unknown): string | undefined {
  if (typeof status === 'string' || typeof status === 'number') {
    try {
      return getReasonPhrase(status);
    } catch {}
  }
}

export default function ErrorContent({ error }: { error: unknown }) {
  let title = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (
    isRouteErrorResponse(error) ||
    (typeof error == 'object' && error != null && 'status' in error)
  ) {
    title = `Error ${error.status}`;
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : ('statusText' in error && typeof error.statusText === 'string'
            ? error.statusText
            : getStatusText(error.status)) || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = `An unexpected error occurred: ${error.name}: ${error.message}`;
    stack = error.stack;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="space-y-3">
          <h1
            className="text-center font-serif text-5xl font-bold text-gray-900
              dark:text-white"
          >
            {title}
          </h1>
          <hr className="text-gray-500" />
          <p
            className="text-center leading-relaxed text-gray-700
              dark:text-gray-300"
          >
            {details}
          </p>
        </div>

        {stack && (
          <div className="mt-6">
            <pre
              className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm
                text-gray-800 shadow-inner dark:bg-gray-800 dark:text-gray-200"
            >
              <code>{stack}</code>
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
