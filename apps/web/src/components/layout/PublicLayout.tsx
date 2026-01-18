import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Music } from 'lucide-react';

export function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
            <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-indigo-600 text-white p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                                <span className="font-bold text-xl leading-none">F</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900">Filadélfias</span>
                        </Link>

                        {/* Nav Links (Desktop) */}
                        <nav className="hidden md:flex gap-8">
                            <Link to="/bible" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                                <BookOpen size={18} />
                                <span>Bíblia</span>
                            </Link>
                            <Link to="/hymnal" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                                <Music size={18} />
                                <span>Hinário</span>
                            </Link>
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                                Entrar
                            </Link>
                            <Link
                                to="/onboarding"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all hover:shadow-md"
                            >
                                Cadastre sua Igreja
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-bold text-lg text-gray-900">Filadélfias</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-xs">
                            Sistema de gestão eclesiástica focado em princípios, simplicidade e edificação do corpo de Cristo.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Recursos</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link to="/bible" className="hover:text-indigo-600">Bíblia Online</Link></li>
                            <li><Link to="/hymnal" className="hover:text-indigo-600">Hinário</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><span className="cursor-not-allowed opacity-50">Termos de Uso</span></li>
                            <li><span className="cursor-not-allowed opacity-50">Privacidade</span></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Filadélfias. Soli Deo Gloria.
                </div>
            </footer>
        </div>
    );
}
