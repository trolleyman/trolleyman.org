import Img from '~/components/Img';

// @ts-ignore
import largeTestImage from './test_large.png?as=picture&format=webp;avif;jpg&w=300;500;700;1000;';
// @ts-ignore
import smallTestImage from './test_small.png?as=picture&format=webp;avif;jpg&w=300;500;700;1000;';

export default function ImageTestPage() {
  return (
    <>
      <Img src={largeTestImage} />
      <Img src={smallTestImage} />
    </>
  );
}
