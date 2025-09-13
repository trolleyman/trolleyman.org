import Img from "~/components/Img";

// @ts-ignore
import largeTestImage from './test_large.png?w=300;500;700;1000;&format=webp;avif;jpg&as=picture'
// @ts-ignore
import smallTestImage from './test_small.png?w=300;500;700;1000;&format=webp;avif;jpg&as=picture'

export default function ImageTestPage() {
    return <>
        <Img src={largeTestImage} />
        <Img src={smallTestImage} />
    </>
}