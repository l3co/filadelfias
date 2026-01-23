import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Music, MapPin, Book, Menu, X } from 'lucide-react';

export function PublicLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
            <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="group">
                            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600 group-hover:from-green-800 group-hover:to-teal-700 transition-all">
                                Filadélfias
                            </span>
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
                            <Link to="/manual" className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center gap-2 transition-colors">
                                <Book size={16} />
                                <span>Manual</span>
                            </Link>
                            <span className="text-sm font-medium text-gray-400 cursor-not-allowed flex items-center gap-2" title="Em breve">
                                <MapPin size={16} />
                                <span>Igrejas Perto</span>
                            </span>
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 hover:text-green-700 hover:border-green-200">
                                Entrar
                            </Link>
                            
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white">
                        <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                            <Link 
                                to="/bible" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                            >
                                <BookOpen size={20} />
                                <span className="font-medium">Bíblia</span>
                            </Link>
                            <Link 
                                to="/hymnal" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                            >
                                <Music size={20} />
                                <span className="font-medium">Hinário</span>
                            </Link>
                            <Link 
                                to="/manual" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                            >
                                <Book size={20} />
                                <span className="font-medium">Manual</span>
                            </Link>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                                <MapPin size={20} />
                                <span className="font-medium">Igrejas Perto</span>
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Em breve</span>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex-grow flex flex-col">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                                Filadélfias
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm italic leading-relaxed">
                            "Esta plataforma foi criada pela Igreja Presbiteriana de Vila Gustavo, para auxiliar na gestão da igreja e comunidade."
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Recursos</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><Link to="/bible" className="hover:text-green-700">Bíblia Online</Link></li>
                                <li><Link to="/hymnal" className="hover:text-green-700">Hinário</Link></li>
                                <li><Link to="/manual" className="hover:text-green-700">Manual Presbiteriano</Link></li>
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
