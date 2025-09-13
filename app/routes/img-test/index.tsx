import Img from "~/components/Img";

// TODO: Use this for all other images
// @ts-ignore
import largeTestImage from './test_large.png' with { type: 'png', as: 'picture', format: 'webp;avif;jpg', width: '300;500;700;1000;' };
// @ts-ignore
import smallTestImage from './test_small.png' with { type: 'png', as: 'picture', format: 'webp;avif;jpg', width: '300;500;700;1000;' };

export default function ImageTestPage() {
    return <>
        <Img src={largeTestImage} />
        <Img src={smallTestImage} />
    </>
}