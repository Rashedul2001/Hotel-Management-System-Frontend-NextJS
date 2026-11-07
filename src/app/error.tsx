"use client"; // Error boundaries must be Client Components

import Link from "next/link";

export default function GlobalError() {

    return (
        <div className="flex flex-col justify-center items-center bg-white dark:bg-zinc-950 px-4 min-h-screen text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
            <div className="space-y-6 w-full max-w-md text-center">
                <div className="flex justify-center">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="font-bold text-3xl tracking-tight">
                        Something went wrong
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        An unexpected error has occurred. We are working on fixing it.
                    </p>
                </div>

                <div className="flex sm:flex-row flex-col justify-center items-center gap-3 pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 px-5 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 w-full sm:w-auto font-medium text-white dark:text-zinc-900 transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="block bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 w-full sm:w-auto font-medium text-zinc-900 dark:text-zinc-50 transition-colors"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}