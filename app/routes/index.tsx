import { FaGithub, FaLinkedin, FaEnvelope, FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router';

import headshotImg from './headshot.jpg'
import Img from '~/components/Img';

export default function Index() {
    return <>
        {/* Profile Section */}
        <div className="text-center space-y-6">
            {/* Profile Picture */}
            <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1 mx-auto">
                    <div className="w-full h-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {/* Headshot */}
                        <Img className='w-full h-full' src={headshotImg} />
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
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                >
                    <FaGithub className="text-xl" />
                </Link>
                <Link
                    to="https://twitter.com/trolleyman0"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="@trolleyman0"
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                >
                    <FaXTwitter className="text-xl" />
                </Link>
                <Link
                    to="https://linkedin.com/callum.tolley"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="@callum.tolley"
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                >
                    <FaLinkedin className="text-xl" />
                </Link>
                <Link
                    to="mailto:callumgtolley@gmail.com"
                    title="callumgtolley@gmail.com"
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                >
                    <FaEnvelope className="text-xl" />
                </Link>
            </div>
        </div>
    </>
}