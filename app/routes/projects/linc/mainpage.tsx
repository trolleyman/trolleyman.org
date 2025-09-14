import { Link } from 'react-router';
import BodyLink from '~/components/BodyLink';

import './css/base.css';
import './css/mainpage/main.css';
import './css/mainpage/main-mod.css';

import lincLogo from './img/demo/linc_logo.png';
import connectLaunchImg from './img/demo/mainpage/CONNECT_LAUNCH_031.jpg';
import connectWhiteImg from './img/demo/mainpage/CONNECT_WHITE.jpg';
import connectBlackImg from './img/demo/mainpage/CONNECT_BLACK.jpg';
import faviconUrl from './img/demo/mainpage/favicon.ico';

export default function LincMainPage() {
  return (
    <>
      <link rel="shortcut icon" type="image/png" href={faviconUrl} />
      <link
        rel="stylesheet"
        href="https://unpkg.com/font-awesome@4.6.3/css/font-awesome.min.css"
      />
      <div className="linc-mainpage">
        {/* Header */}
        <div id="header">
          <span className="logo icon">
            <img src={lincLogo} alt="LINC Logo" />
          </span>
          <h1>LINC</h1>
          <p>
            <i>The People Network</i>
          </p>
        </div>

        {/* Main */}
        <div id="main">
          <header className="major container 75%">
            <p>
              LINC is a digital networking visualisation, connecting people
              based on their interests, hobbies and skills.
            </p>
          </header>

          <div className="box alt container">
            <section className="feature left">
              <img src={connectLaunchImg} alt="CONNECT Launch Event" />
              <div className="content">
                <h3>This is LINC: Events</h3>
                <p>
                  Use LINC as a digital logbook: a creative way to look back at
                  who was your event, or as a way to tailor future events by
                  learning about your attendees.
                </p>
              </div>
            </section>
            <section className="feature right">
              <img src={connectWhiteImg} alt="CONNECT White" />
              <div className="content">
                <h3>This is LINC: Network</h3>
                <p>
                  LINC visualises connections between people; connections
                  between interests; or even connections between events.
                </p>
                <p style={{ textAlign: 'right' }}> You decide.</p>
              </div>
            </section>
            <section className="feature left">
              <img src={connectBlackImg} alt="CONNECT Black" />
              <div className="content">
                <h3>This is LINC: Business</h3>
                <p>
                  Work out team dynamics, plot relations between projects, or
                  visualise group synergy.
                </p>
              </div>
            </section>
          </div>

          <footer id="features" className="major container 75%">
            <h3>Features</h3>
            <ul>
              <li>Fully configurable - use your branding</li>
              <li>
                Twitter integration - populate LINC with images from the social
                network
              </li>
              <li>Logo View - your logo, on view</li>
              <li>Insights - look at the data behind the connections</li>
            </ul>
          </footer>

          <Link to="/projects/linc/demo" id="demo" className="button">
            See it in action
            <span className="indicator-container">
              <i className="indicator fa fa-angle-right"></i>
            </span>
          </Link>
        </div>

        {/* Footer */}
        <div id="footer">
          <div className="container 75%">
            <ul className="copyright">
              <li>
                &copy;
                <BodyLink to="http://trolleyman.org">
                  Callum Tolley
                </BodyLink>,{' '}
                <BodyLink to="http://peran.co">Peran Truscott</BodyLink> and{' '}
                <BodyLink to="http://tomg.io">Tom Goodman</BodyLink>
              </li>
              <li>
                Design: <BodyLink to="http://html5up.net">HTML5 UP</BodyLink>
              </li>
            </ul>
            <ul className="copyright">
              <li>
                Developed with, and images courtesy of{' '}
                <BodyLink to="https://www.millenniumpoint.org.uk/">
                  Millennium Point
                </BodyLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
