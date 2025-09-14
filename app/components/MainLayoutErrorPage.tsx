import ErrorContent from './ErrorContent';
import MainLayoutChildren from '~/layouts/MainLayoutChildren';

export default function MainLayoutErrorPage({ error }: { error: unknown }) {
  return (
    <MainLayoutChildren>
      <ErrorContent error={error} />
    </MainLayoutChildren>
  );
}
