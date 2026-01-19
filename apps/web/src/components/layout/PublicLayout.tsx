import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Music, MapPin, Book } from 'lucide-react';

export function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
            <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-green-700 text-white p-1.5 rounded-lg group-hover:bg-green-800 transition-colors">
                                <span className="font-bold text-xl leading-none">F</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">Filadélfias</span>
                        </Link>

                        {/* Nav Links (Desktop) */}
                        <nav className="hidden md:flex gap-6 items-center">
                            <Link to="/bible" className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center gap-2 transition-colors">
                                <BookOpen size={16} />
                                <span>Bíblia</span>
                            </Link>
                            <Link to="/hymnal" className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center gap-2 transition-colors">
                                <Music size={16} />
                                <span>Hinário</span>
                            </Link>
                            <span className="text-sm font-medium text-gray-400 cursor-not-allowed flex items-center gap-2" title="Em breve">
                                <Book size={16} />
                                <span>Manual</span>
                            </span>
                            <span className="text-sm font-medium text-gray-400 cursor-not-allowed flex items-center gap-2" title="Em breve">
                                <MapPin size={16} />
                                <span>Igrejas Perto</span>
                            </span>
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 hover:text-green-700 hover:border-green-200">
                                Entrar
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-lg text-gray-900">Filadélfias</span>
                        </div>
                        <p className="text-gray-500 text-sm italic leading-relaxed">
                            "Esta é uma homenagem a um dos nossos amado Reverendo Eliézer Marra. Em uma das suas pregações a respeito do livro de Apocalipse, uma vez ele disse: tenho uma proposta, que tal mudarmos o nome de nossa Igreja para Filadélfia?"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Recursos</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><Link to="/bible" className="hover:text-green-700">Bíblia Online</Link></li>
                                <li><Link to="/hymnal" className="hover:text-green-700">Hinário</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Acesso</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><Link to="/login" className="hover:text-green-700">Login</Link></li>
                                <li><Link to="/onboarding" className="hover:text-green-700">Cadastrar Igreja</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Filadélfias. Soli Deo Gloria.
                </div>
            </footer>
        </div>
    );
}
