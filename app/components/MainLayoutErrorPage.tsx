import MainLayoutChildren from "~/layouts/MainLayoutChildren";
import ErrorContent from "./ErrorContent";

export default function MainLayoutErrorPage({ error }: { error: unknown }) {
    return <MainLayoutChildren>
        <ErrorContent error={error} />
    </MainLayoutChildren>
}