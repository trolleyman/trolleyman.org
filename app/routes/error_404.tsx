import ErrorContent from "~/components/ErrorContent";

export function loader() {
    throw new Response(null, {
        status: 404,
        statusText: "Not Found",
    });
}

export default function NotFound() {
    return <ErrorContent error={{ status: 404 }} />
}
