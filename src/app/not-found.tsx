'use client';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
                <h2 className="mt-2 text-2xl font-semibold text-gray-600 dark:text-gray-400">
                    Página não encontrada
                </h2>
                <p className="mt-2 text-gray-500 dark:text-gray-500">
                    A página que você está procurando não existe.
                </p>
                <a
                    href="/"
                    className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                    Voltar ao início
                </a>
            </div>
        </div>
    );
}