import { FaGithub, FaLinkedin, FaEnvelope, FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router';

import Img from '~/components/Img';

// @ts-ignore
import headshotImg from './headshot.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;';

export default function Index() {
  return (
    <>
      {/* Profile Section */}
      <div className="space-y-6 text-center">
        {/* Profile Picture */}
        <div className="relative">
          <div
            className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br
              from-blue-400 to-purple-600 p-1"
          >
            <div
              className="flex h-full w-full items-center justify-center
                overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {/* Headshot */}
              <Img className="h-full w-full" src={headshotImg} />
            </div>
          </div>
        </div>

        {/* Name and Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Callum Tolley
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Software Engineer
          </p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6">
          <Link
            to="https://github.com/trolleyman"
            target="_blank"
            rel="noopener noreferrer"
            title="@trolleyman"
            className="flex h-12 w-12 items-center justify-center rounded-full
              bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600
              dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900
              dark:hover:text-blue-400"
          >
            <FaGithub className="text-xl" />
          </Link>
          <Link
            to="https://twitter.com/trolleyman0"
            target="_blank"
            rel="noopener noreferrer"
            title="@trolleyman0"
            className="flex h-12 w-12 items-center justify-center rounded-full
              bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600
              dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900
              dark:hover:text-blue-400"
          >
            <FaXTwitter className="text-xl" />
          </Link>
          <Link
            to="https://linkedin.com/callum.tolley"
            target="_blank"
            rel="noopener noreferrer"
            title="@callum.tolley"
            className="flex h-12 w-12 items-center justify-center rounded-full
              bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600
              dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900
              dark:hover:text-blue-400"
          >
            <FaLinkedin className="text-xl" />
          </Link>
          <Link
            to="mailto:callumgtolley@gmail.com"
            title="callumgtolley@gmail.com"
            className="flex h-12 w-12 items-center justify-center rounded-full
              bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600
              dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900
              dark:hover:text-blue-400"
          >
            <FaEnvelope className="text-xl" />
          </Link>
        </div>
      </div>
    </>
  );
}
