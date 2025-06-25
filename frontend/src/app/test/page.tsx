export default function TestPage() {
    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold text-blue-600 mb-4">
                    Página de Teste - PollsIA
                </h1>
                <p className="text-gray-700 mb-4">
                    Se você está vendo esta página, o Next.js está funcionando corretamente!
                </p>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">Status dos Recursos:</h2>
                    <ul className="text-left">
                        <li>✅ Next.js App Router</li>
                        <li>✅ TailwindCSS</li>
                        <li>✅ TypeScript</li>
                        <li>✅ Componentes React</li>
                    </ul>
                </div>
                <div className="mt-4">
                    <a
                        href="/"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Voltar para Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
} 