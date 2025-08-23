import Banner, { type BannerProps } from "../Banner";

import './main.css'
import './main-mod.css'

export type MainLayoutProps = React.PropsWithChildren<{
    preHeader?: React.ReactNode;
    header?: React.ReactNode;
    banner: BannerProps;
    footer?: React.ReactNode;
}>;

export default function MainLayout({
    children,
    preHeader,
    header,
    banner,
    footer,
}: MainLayoutProps) {
    return (<>
        {/* Page Wrapper */}
        <div id="page-wrapper">
            {/* Header */}
            <header id="header" className="alt">
                <ul>
                    {preHeader}
                    <li className="title"><h1><a href="/">Callum Tolley</a></h1></li>
                    {header}
                </ul>
            </header>

            <Banner {...banner} />

            {/* Wrapper */}
            <section id="wrapper">
                {children}
            </section>

            {/* Footer */}
            <section id="footer">
                <div className="inner">
                    {footer}
                    <ul className="copyright">
                        <li>&copy; Callum Tolley</li><li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
                    </ul>
                </div>
            </section>
        </div>
    </>)
}