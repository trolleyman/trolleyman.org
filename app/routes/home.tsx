import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";

type ProjectProps = {
	title: string;
	date: string;
	description: string;
	image: string;
	links: { href: string; label: string; external?: boolean }[];
	tags: string[];
};

const Project: React.FC<ProjectProps> = ({ title, date, description, image, links, tags }) => (
	<article className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row">
		<img
			src={image}
			alt={title}
			className="w-32 h-32 object-cover rounded mb-4 md:mb-0 md:mr-6"
		/>
		<div>
			<h4 className="text-lg font-semibold">{title}</h4>
			<div className="text-sm text-gray-500 mb-2">{date}</div>
			<p className="mb-2">{description}</p>
			<div className="flex flex-wrap gap-2 mb-2">
				{tags.map(tag => (
					<span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{tag}</span>
				))}
			</div>
			<div className="flex space-x-4">
				{links.map(link => (
					<a
						key={link.href}
						href={link.href}
						target={link.external ? "_blank" : undefined}
						className="text-blue-600 hover:underline text-sm"
						rel={link.external ? "noopener noreferrer" : undefined}
					>
						{link.label}
					</a>
				))}
			</div>
		</div>
	</article>
);

const projects: ProjectProps[] = [
	{
		title: "Dissertation",
		date: "2018-19",
		description:
			"Final year project exploring Google DeepMind's research into developing general AI for Atari 2600 games using deep learning.",
		image: "/static/img/projects/dissertation/breakout.png",
		links: [
			{ href: "/static/files/Dissertation.pdf", label: "Paper PDF", external: true },
			{ href: "projects/dissertation", label: "More details" },
		],
		tags: ["Python", "TensorFlow", "PyTorch"],
	},
	{
		title: "trolleyman.org",
		date: "2018",
		description: "Created this website to keep track of the projects I've been working on.",
		image: "/static/img/projects/website/screenshot.png",
		links: [
			{ href: "https://github.com/trolleyman/trolleyman.org", label: "Github", external: true },
			{ href: "projects/website", label: "More details" },
		],
		tags: ["Rust", "WASM", "JavaScript", "CSS", "SQL", "Rocket"],
	},
	// ...add other projects here in the same format
];

export default function Home() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<header className="bg-white shadow">
				<div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
					<h1 className="text-3xl font-bold">Callum Tolley</h1>
					<div className="flex space-x-4 mt-2 md:mt-0">
						<a href="/static/files/CV.pdf" target="_blank" className="text-blue-600 hover:underline">CV</a>
						<a href="#contact" className="text-blue-600 hover:underline">Contact</a>
						<a href="https://github.com/trolleyman" target="_blank" className="text-gray-600 hover:text-black">
							<FontAwesomeIcon icon={faGithub} size="lg" />
						</a>
						<a href="https://www.linkedin.com/in/callum-tolley/" target="_blank" className="text-blue-700 hover:text-blue-900">
							<FontAwesomeIcon icon={faLinkedin} size="lg" />
						</a>
					</div>
				</div>
			</header>
			<main className="max-w-4xl mx-auto px-4 py-10">
				<section className="mb-10">
					<div className="flex items-center space-x-4">
						<div className="text-5xl text-blue-500">
							<FontAwesomeIcon icon={faCode} />
						</div>
						<div>
							<h2 className="text-2xl font-semibold">Hi, I'm Callum.</h2>
							<p className="mt-2 text-gray-700">
								I'm currently a software developer at <a href="https://www.ocadotechnology.com/" className="text-blue-600 hover:underline">Ocado</a>.
								My contact details can be found <a href="#contact" className="text-blue-600 hover:underline">here</a>.
								Below's a list of projects that probably won't interest you.
							</p>
						</div>
					</div>
				</section>
				<section>
					<h3 className="text-xl font-bold mb-6">Projects</h3>
					<div className="space-y-8">
						{projects.map((project, idx) => (
							<Project key={idx} {...project} />
						))}
					</div>
				</section>
				<section className="mt-16">
					<h3 className="text-xl font-bold mb-2">Contact Details</h3>
					<p>If you have any queries relating to jobs, my details are below.</p>
					<ul className="mt-2">
						<li>
							<FontAwesomeIcon icon={faEnvelope} className="mr-2" />
							<a href="mailto:callumgtolley@gmail.com" className="text-blue-600 hover:underline">
								callumgtolley@gmail.com
							</a>
						</li>
					</ul>
				</section>
			</main>
			<footer className="bg-white border-t mt-16 py-4 text-center text-sm text-gray-500">
				&copy; Callum Tolley &mdash; Design: <a href="http://html5up.net" className="text-blue-600 hover:underline">HTML5 UP</a>
			</footer>
		</div>
	);
}
