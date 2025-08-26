import ErrorContent from "~/components/ErrorContent";

export default function NotFound() {
    return <ErrorContent error={{ status: 404 }} />
}
