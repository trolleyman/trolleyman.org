import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faDesktop, faEnvelope, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '~/components/ThemeProvider';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Link, type LinkProps, type To } from 'react-router';
import type React from 'react';
import clsx from 'clsx';
import { emailUrl, fullName, githubUrl, twitterUrl } from '~/data/info';

// Example: import projects from a local file or paste the array here
const projects = [
    {
        id: 'dissertation',
        title: 'Dissertation',
        date: '2018-19',
        image: '/static/img/projects/dissertation/breakout.png',
        url: 'projects/dissertation',
        description: "Final year project exploring Google DeepMind's research into developing general AI for Atari 2600 games using deep learning.",
        achievement: 'Achieved a 1st class mark for this project.',
        languages: ['Python'],
        frameworks: ['TensorFlow', 'PyTorch'],
        links: [
            { label: 'Paper PDF', url: '/static/files/Dissertation.pdf', target: '_blank' },
            { label: 'More details', url: 'projects/dissertation' }
        ]
    },
    {
        id: 'website',
        title: 'trolleyman.org',
        date: '2018',
        image: '/static/img/projects/website/screenshot.png',
        url: 'projects/website',
        description: "Created this website to keep track of the projects I've been working on.",
        languages: ['Rust', 'WASM', 'JavaScript', 'CSS', 'SQL'],
        frameworks: ['Rocket'],
        links: [
            { label: 'Github', url: 'https://github.com/trolleyman/trolleyman.org' },
            { label: 'More details', url: 'projects/website' }
        ]
    },
    {
        id: 'linc',
        title: 'LINC',
        date: 'Jun. 2017',
        image: '/static/img/projects/linc/logo.min.png',
        url: 'projects/linc',
        description: 'A versatile social network visualization tool, developed with Millennium Point.',
        languages: ['HTML', 'JavaScript', 'CSS', 'SQL', 'Python'],
        frameworks: ['Three.js', 'D3.js', 'Django'],
        links: [
            { label: 'Website', url: 'linc' },
            { label: 'Demo', url: 'linc/demo' },
            { label: 'More details', url: 'projects/linc' }
        ]
    },
    {
        id: 'flappy',
        title: 'Flappy Clone',
        date: 'Dec. 2016 - Jul. 2017',
        image: '/static/img/projects/flappy/logo.png',
        url: 'projects/flappy',
        description: 'Yet another Flappy Bird clone.',
        languages: ['HTML', 'JavaScript', 'CSS', 'SQL', 'Python'],
        frameworks: ['HTML5 Canvas API', 'Django'],
        links: [
            { label: 'Demo', url: '/flappy' },
            { label: 'More details', url: 'projects/flappy' }
        ]
    },
    {
        id: 'zucchini',
        title: 'Zucchini',
        date: 'Jul. 2017',
        image: '/static/img/projects/zucchini/logo.min.gif',
        url: 'projects/zucchini',
        description: 'Atmospheric fast-paced top down shooter. Developed with 5 other students.',
        languages: ['Java', 'Java', 'more Java'],
        frameworks: ['LWJGL', 'OpenGL', 'OpenAL'],
        links: [
            { label: 'Github', url: 'https://github.com/trolleyman/Zucchini' },
            { label: 'More details', url: 'projects/zucchini' }
        ]
    },
    {
        id: 'robot',
        title: 'Robot Warehouse',
        date: 'Apr. 2016',
        image: '/static/img/projects/robot/casterbot.min.jpg',
        url: 'projects/robot',
        description: 'Robot warehouse management system. Developed with 9 other students.',
        languages: ['Yet more Java'],
        frameworks: ['LeJOS', 'Swing'],
        links: [
            { label: 'Github', url: 'https://github.com/trolleyman/rp-warehouse' },
            { label: 'More details', url: 'projects/robot' }
        ]
    },
    {
        id: 'portal',
        title: 'Portal 2',
        date: 'Nov. 2016',
        image: '/static/img/projects/portal/screenshot.min.jpg',
        url: 'projects/portal',
        description: 'A redo of my first Portal project, a shameless attempt to copy my favourite video game at the time, Portal. Guess that makes this a redo of a redo.',
        languages: ['Rust and OpenGL'],
        links: [
            { label: 'Github', url: 'https://github.com/trolleyman/Portal2' }
        ]
    },
    {
        id: 'k-means',
        title: 'k-means',
        date: 'Sep. 2016',
        image: '/static/img/projects/k-means/alabama-hills-ca.min.jpg',
        url: 'projects/k-means',
        description: 'Using the k-means algorithm to create pretty pictures.',
        languages: ['Rust'],
        links: [
            { label: 'Github', url: 'https://github.com/trolleyman/kmeans' }
        ]
    },
    {
        id: 'equator',
        title: 'Equator',
        date: 'Dec. 2016',
        image: '/static/img/projects/equator/screenshot.jpg',
        url: 'projects/equator',
        description: 'An expression editor and evaluator that allows easy visualization and processing of mathematical expressions.',
        languages: ['Rust using GTK+'],
        links: [
            { label: 'Github', url: 'https://github.com/trolleyman/Equator' }
        ]
    }
];

const titleFontClass = 'font-abril-fatface'

function HoverLink(props: LinkProps) {
    const { className, ...rest } = props;
    return <Link className={clsx('hover:text-blue-400', className)} {...rest} />
}

function BodyLink(props: LinkProps) {
    const { className, ...rest } = props;
    return <HoverLink className={clsx('text-blue-900 dark:text-blue-200 hover:text-blue-500', className)} {...rest} />
}

function HeaderIconLink(props: LinkProps & { icon: IconProp }) {
    return <HoverLink className='w-[1lh] h-[1lh] text-gray-400 flex items-center justify-center' {...props}>
        <FontAwesomeIcon icon={props.icon} className='w-full h-full!' />
    </HoverLink>;
}

function Header() {
    return <header className='text-white bg-[#2e3141] shadow fixed top-0 w-full z-[10000]'>
        <div className='max-w-4xl mx-auto py-6 px-4 flex justify-between items-center'>
            <HoverLink to='/' className={clsx('text-3xl font-bold', titleFontClass)}>Callum Tolley</HoverLink>
            <nav className='flex items-center space-x-3'>
                <ul className='flex space-x-8'>
                    <li><HoverLink to='#cv'>CV</HoverLink></li>
                    <li><HoverLink to='#contact'>Contact</HoverLink></li>
                </ul>
            </nav>
        </div>
    </header>
}

export function NewHomePage() {
    return <div className='min-h-screen'>
        <Header/>
        <div>
            {/* Banner */}
            <section className='bg-[#2e3141]'>
                BANNER CONTENT
            </section>
        </div>
    </div>
}


export default function HomePage() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    if (true) {
        return <NewHomePage />
    }

    return (
        <div className='min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-raleway'>
            {/* Header */}
            <header className='bg-white dark:bg-gray-800 shadow'>
                <div className='max-w-4xl mx-auto py-6 px-4 flex justify-between items-center'>
                    <HoverLink to='/' className={clsx('text-3xl font-bold', titleFontClass)}>Callum Tolley</HoverLink>
                    <nav className='flex items-center space-x-3'>
                        <ul className='flex space-x-8 mr-8'>
                            <li><HoverLink to='#about'>About</HoverLink></li>
                            <li><HoverLink to='#projects'>Projects</HoverLink></li>
                            <li><HoverLink to='#contact'>Contact</HoverLink></li>
                        </ul>
                        <HeaderIconLink icon={faGithub} to={githubUrl} title='GitHub' target='_blank' />
                        <HeaderIconLink icon={faTwitter} to={twitterUrl} title='Twitter' target='_blank' />
                        <HeaderIconLink icon={faEnvelope} to={emailUrl} title='Email' target='_blank' />
                        <HeaderIconLink to='#'
                            icon={theme === 'system' ? faDesktop : theme === 'dark' ? faMoon : faSun}
                            onClick={() => setTheme(theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system')}
                            title={theme === 'system' ? `System theme (${resolvedTheme === 'dark' ? 'dark' : 'light'})` : theme === 'dark' ? 'Dark theme' : 'Light theme'} />
                    </nav>
                </div>
            </header>

            {/* About Section */}
            <section id='about' className='max-w-4xl mx-auto py-12 px-4'>
                <p className='text-lg'>Hi! I'm Callum, a software developer working at <BodyLink to='https://www.ocadogroup.com/'>Ocado</BodyLink>. This is my little corner of the internet!</p>
            </section>

            {/* Projects Section */}
            <section id='projects' className='max-w-4xl mx-auto py-12 px-4'>
                <h2 className={clsx('text-2xl font-semibold mb-4', titleFontClass)}>Projects</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    {projects.map(project => (
                        <div key={project.id} className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                            <img src={project.image} alt={project.title} className='w-full h-40 object-cover rounded mb-4' />
                            <h3 className='text-xl font-bold mb-2'>{project.title}</h3>
                            <p className='mb-2 text-sm text-gray-400 dark:text-gray-500'>{project.date}</p>
                            <p className='mb-2'>{project.description}</p>
                            {project.achievement && <p className='mb-2 text-green-400 dark:text-green-300'>{project.achievement}</p>}
                            <div className='mb-2 text-xs'>
                                <span className='font-semibold'>Languages:</span> {project.languages.join(', ')}
                            </div>
                            {project.frameworks && (
                                <div className='mb-2 text-xs'>
                                    <span className='font-semibold'>Frameworks:</span> {project.frameworks.join(', ')}
                                </div>
                            )}
                            <div className='flex flex-wrap gap-2 mt-2'>
                                {project.links && project.links.map((link, idx) => (
                                    <a key={idx} href={link.url} target={link.target || '_self'} rel='noopener noreferrer' className='text-blue-400 hover:underline text-sm px-2 py-1 border border-blue-400 rounded'>
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id='contact' className='max-w-4xl mx-auto py-12 px-4'>
                <h2 className={clsx('text-2xl font-semibold mb-4', titleFontClass)}>Contact</h2>
                <div className='flex items-center space-x-4 mb-6'>
                    <a href='https://github.com/trolleyman' target='_blank' rel='noopener noreferrer' className='text-2xl hover:text-blue-400' aria-label='GitHub'><FontAwesomeIcon icon={faGithub} /></a>
                    <a href='mailto:your@email.com' className='text-2xl hover:text-blue-400' aria-label='Email'><FontAwesomeIcon icon={faEnvelope} /></a>
                    <a href='https://linkedin.com/in/yourprofile' target='_blank' rel='noopener noreferrer' className='text-2xl hover:text-blue-400' aria-label='LinkedIn'><FontAwesomeIcon icon={faLinkedin} /></a>
                </div>
                <form className='space-y-4'>
                    <input type='text' placeholder='Name' className='w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-100' />
                    <input type='email' placeholder='Email' className='w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-100' />
                    <textarea placeholder='Message' className='w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-100' rows={4} />
                    <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Send</button>
                </form>
            </section>

            {/* Footer */}
            <footer className='bg-white border-t mt-12 py-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400'>
                &copy; {new Date().getFullYear()} {fullName}
            </footer>
        </div>
    );
}
