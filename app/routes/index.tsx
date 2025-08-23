import path from 'path';
import fs from 'fs/promises';
import { useState } from 'react';
import { Link, useLoaderData } from 'react-router';

import type { Route } from './+types';
import MainLayout from '~/components/main/MainLayout';

import './index.css'

export async function loader({ }: Route.LoaderArgs) {
  const subDir = 'static/img/bg'
  const imgDir = path.resolve('public', subDir);
  var bgFiles = (await fs.readdir(imgDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.match(/\d\d\.(jpg)$/i))
    .map((entry) => path.join(subDir, entry.name).replaceAll(/\\/g, '/'));
  return {
    bgFiles,
  };
}

export default function Index() {
  const bgFiles = useLoaderData().bgFiles;
  const [url] = useState<string | null>(() => {
    return bgFiles.length > 0 ? bgFiles[Math.floor(Math.random() * bgFiles.length)] : null;
  });

  const header = <>
    <li><Link to="/static/files/CV.pdf" target="_blank">CV</Link></li>
    <li><Link to="#contact">Contact</Link></li>
  </>

  const bannerChildren = <>
    <div className="logo"><span className="icon fa-code"></span></div>
    <h2 className="clearfix">Callum&nbsp;Tolley
      <a className="heading-left" target="_blank" href="/static/files/CV.pdf">
        CV
      </a>
      <span className="heading-right">
        <a href="https://github.com/trolleyman"><FontAwesomeIcon icon="github"/></a>
        <a href="https://www.linkedin.com/in/callum-tolley/"><span className="fa fa-linkedin"></span></a>
        <a href="#contact"><span className="fa fa-envelope"></span></a>
      </span>
    </h2>
    {/* <p>Software Developer<span className="spacer"></span>Student</p> */}
    <p className="summary">
      Hi, I'm Callum. I'm currently a software developer at <a href="https://www.ocadotechnology.com/">Ocado</a>. My contact details can be found <a href="#contact">here</a>. Below's a list of projects that probably won't interest you.
    </p>
  </>

  const footer = <>
    <div id="contact">
      <h2 className="major">Contact Details</h2>
      <p>If you have any queries relating to jobs, my details are below.</p>
      <div id="contact-inner">
        <ul className="contact">
          <li className="fa-envelope">
            <a href="mailto:callumgtolley@gmail.com">callumgtolley@gmail.com</a>
          </li>
        </ul>
      </div>
    </div>
  </>

  return <MainLayout header={header} banner={{ url: url ?? undefined, children: bannerChildren }} footer={footer}>
    <section className="wrapper spotlight style1">
      <div id="proj_dissertation" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/dissertation" className="image box-shadow pixelated"><img src="/static/img/projects/dissertation/breakout.png" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>Dissertation</h2>
            <div className="date">2018-19</div>
          </div>
          <p>Final year project exploring Google DeepMind's research into developing general AI for Atari 2600 games using deep learning.</p>
          <p>Achieved a 1st class mark for this project.</p>
          <div className="used">Languages: Python</div>
          <div className="used">Frameworks: TensorFlow, PyTorch</div>
          <ul className="links">
            <li><a href="/static/files/Dissertation.pdf" className="special" target="_blank">Paper PDF</a></li>
            <li><a href="projects/dissertation" className="special">More details</a></li>
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper alt spotlight style2">
      <div id="proj_website" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/website" className="image box-shadow"><img src="/static/img/projects/website/screenshot.png" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>trolleyman.org</h2>
            <div className="date">2018</div>
          </div>
          <p>Created this website to keep track of the projects I've been working on.</p>
          <div className="used">Languages: Rust, WASM, JavaScript, CSS, SQL</div>
          <div className="used">Framework: <a href="https://rocket.rs">Rocket</a></div>
          <ul className="links">
            <li><a href="https://github.com/trolleyman/trolleyman.org" className="special">Github</a></li>
            <li><a href="projects/website" className="special">More details</a></li>
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper spotlight style3">
      <div id="proj_linc" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/linc" className="image drop-shadow"><img src="/static/img/projects/linc/logo.min.png" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>LINC</h2>
            <div className="date">Jun. 2017</div>
          </div>
          <p>A versatile social network visualization tool, developed with <a href="https://www.millenniumpoint.org.uk/">Millennium Point.</a></p>
          <div className="used">Languages: HTML, JavaScript, CSS, SQL, Python</div>
          <div className="used">Frameworks: Three.js, D3.js, Django</div>
          <ul className="links">
            <li><a href="linc" className="special">Website</a></li>
            <li><a href="linc/demo" className="special">Demo</a></li>
            <li><a href="projects/linc" className="special">More details</a></li>
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper alt spotlight style4">
      <div id="proj_flappy" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/flappy" className="image drop-shadow pixelated"><img src="/static/img/projects/flappy/logo.png" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>Flappy Clone</h2>
            <div className="date">Dec. 2016 - Jul. 2017</div>
          </div>
          <p>
            Yet another Flappy Bird clone.
          </p>
          <div className="used">Languages: HTML, JavaScript, CSS, SQL, Python</div>
          <div className="used">Frameworks: HTML5 Canvas API, Django</div>
          <ul className="links">
            <li><a href="/flappy" className="special">Demo</a></li>
            <li><a href="projects/flappy" className="special">More details</a></li>
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper spotlight style5">
      <div id="proj_zucchini" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/zucchini" className="image drop-shadow"><img src="/static/img/projects/zucchini/logo.min.gif" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>Zucchini</h2>
            <div className="date">Jul. 2017</div>
          </div>
          <p>
            Atmospheric fast-paced top down shooter. Developed with 5 other students.
          </p>
          <div className="used">Languages: Java, Java, more Java</div>
          <div className="used">Frameworks: LWJGL, OpenGL, OpenAL</div>
          <ul className="links">
            <li><a href="https://github.com/trolleyman/Zucchini" className="special">Github</a></li>
            <li><a href="projects/zucchini" className="special">More details</a></li>
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper alt spotlight style6">
      <div id="robot" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/robot" className="image box-shadow"><img src="/static/img/projects/robot/casterbot.min.jpg" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>Robot Warehouse</h2>
            <div className="date">Apr. 2016</div>
          </div>
          <p>
            Robot warehouse management system. Developed with 9 other students.
          </p>
          <div className="used">Languages: Yet more Java</div>
          <div className="used">Frameworks: <a href="http://www.lejos.org/" title="Java for Lego Mindstorms">LeJOS</a>, Swing</div>
          <ul className="links">
            <li><a href="https://github.com/trolleyman/rp-warehouse" className="special">Github</a></li>
            <li><a href="projects/robot" className="special">More details</a></li>
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper spotlight style5">
      <div id="portal" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/portal" className="image box-shadow"><img src="/static/img/projects/portal/screenshot.min.jpg" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>Portal 2</h2>
            <div className="date">Nov. 2016</div>
          </div>
          <p>
            A redo of my first Portal project, a shameless attempt to copy my favourite video game at the time, Portal. Guess that makes this a redo of a redo.
          </p>
          <div className="used">Rust and OpenGL</div>
          <ul className="links">
            <li><a href="https://github.com/trolleyman/Portal2" className="special">Github</a></li>
            {/* <li><a href="projects/portal" className="special">More details</a></li> */}
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper alt spotlight style4">
      <div id="k-means" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/k-means" className="image box-shadow"><img src="/static/img/projects/k-means/alabama-hills-ca.min.jpg" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>k-means</h2>
            <div className="date">Sep. 2016</div>
          </div>
          <p>
            Using the k-means algorithm to create pretty pictures.
          </p>
          <div className="used">Rust</div>
          <ul className="links">
            <li><a href="https://github.com/trolleyman/kmeans" className="special">Github</a></li>
            {/* <li><a href="projects/k-means" className="special">More details</a></li> */}
          </ul>
        </div>
      </div>
    </section>
    <section className="wrapper spotlight style3">
      <div id="equator" className="scroll-marker"></div>
      <div className="inner">
        <a href="projects/equator" className="image box-shadow"><img src="/static/img/projects/equator/screenshot.jpg" alt="" /></a>
        <div className="content">
          <div className="major">
            <h2>Equator</h2>
            <div className="date">Dec. 2016</div>
          </div>
          <p>
            An expression editor and evaluator that allows easy visualization and processing of mathematical expressions.
          </p>
          <div className="used">Rust using GTK+</div>
          <ul className="links">
            <li><a href="https://github.com/trolleyman/Equator" className="special">Github</a></li>
            {/* <li><a href="projects/equator" className="special">More details</a></li> */}
          </ul>
        </div>
      </div>
    </section>
  </MainLayout>;
}
