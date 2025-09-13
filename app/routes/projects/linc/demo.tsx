import { useEffect, useRef } from "react";

// Import CSS files
import "./css/base.css";
import "./css/display.css";
import logoUrl from "./img/demo/linc_logo_transparent.png";
import { initLinc } from "./.client/init";

export default function LincDemo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const helpMinimizeButtonRef = useRef<HTMLAnchorElement>(null);
    const helpMaximizeButtonRef = useRef<HTMLAnchorElement>(null);
    const toggleAutoRef = useRef<HTMLInputElement>(null);
    const toggleLogoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        initLinc({
            helpMinimizeButtonRef: helpMinimizeButtonRef.current,
            helpMaximizeButtonRef: helpMaximizeButtonRef.current,
            toggleAutoRef: toggleAutoRef.current,
            toggleLogoRef: toggleLogoRef.current,
        }).catch((err) => console.error('Error initializing LINC', err));
    }, []);

    return (
        <>
            <link rel="stylesheet" href="https://unpkg.com/font-awesome@4.6.3/css/font-awesome.min.css" />
            <div className="linc-demo">
                <div id="container" ref={containerRef}>
                    <a href="/projects/linc">
                        <img id="logo" src={logoUrl} alt="LINC Logo" />
                    </a>
                    <div id="debuginfo"></div>
                    <div id="help" className="help-minimized">
                        <div id="help-inner" className="unselectable">
                            <h1>Welcome to LINC</h1>
                            LINC is a connection network, created to
                            link people and interests.<br />
                            <br />
                            Blue Nodes are people in the network and orange Nodes are interests people share.<br />
                            <br />
                            Click on Nodes to get more information, or
                            sit back and allow autospectator to guide
                            you.<br />
                            <br />
                            <i>Developed by Callum Tolley, Peran Truscott, and Tom Goodman
                                with the support of Millennium Point</i>
                        </div>
                        <a id="help-minimize-button" className="help-button fa fa-close" ref={helpMinimizeButtonRef}></a>
                        <a id="help-maximize-button" className="help-button fa fa-question" ref={helpMaximizeButtonRef}></a>
                    </div>
                    <div id="search">
                        <input type="text" placeholder="Search..." />
                        <ul id="search-results"></ul>
                    </div>
                    <ul id="controls" className="unselectable">
                        <li>
                            <span className="offset-text">
                                Manual
                            </span>
                            <label className="switch">
                                <input type="checkbox" id="toggle_auto" ref={toggleAutoRef} />
                                <div className="slider"></div>
                            </label>
                            <span className="offset-text">
                                Auto
                            </span>
                        </li>
                        <li className="unselectable">
                            <span className="offset-text">
                                Normal View
                            </span>
                            <label className="switch">
                                <input type="checkbox" id="toggle_logo" ref={toggleLogoRef} />
                                <div className="slider"></div>
                            </label>
                            <span className="offset-text">
                                Logo View
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}
