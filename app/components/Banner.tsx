
import './Banner.css'

export type BannerProps = React.PropsWithChildren<{
    url?: string
}>

export default function Banner({ url, children }: BannerProps) {
    return (<>
        <section id="banner">
            <div id="banner-bg"></div>
            <div id="banner-overlay"></div>
            <div className="inner">
                {children}
            </div>
        </section>
    </>)
}
