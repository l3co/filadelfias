import { Link } from 'react-router-dom';
import { BookOpen, Music, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 px-4 sm:px-6 lg:px-8 pt-20">
                        <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Gestão para sua Igreja,</span>{' '}
                                    <span className="block text-green-700 xl:inline">Conteúdo para sua Fé.</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Uma plataforma completa para administração eclesiástica e edificação dos membros. Organize sua congregação e tenha acesso rápido à Bíblia e ao Hinário.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/onboarding"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 md:py-4 md:text-lg md:px-10 transition-transform hover:-translate-y-0.5"
                                        >
                                            Começar Agora
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/bible"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-800 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg md:px-10 transition-transform hover:-translate-y-0.5"
                                        >
                                            Ler a Bíblia
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </section>

            {/* Quick Access Section */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bible Card */}
                        <Link to="/bible" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col md:flex-row items-center gap-6 border border-gray-100 group">
                            <div className="h-16 w-16 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen size={32} />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Bíblia Sagrada Online</h3>
                                <p className="text-gray-500 mb-4">Acesse as escrituras sagradas de forma rápida, limpa e responsiva. Ideal para leitura diária e acompanhamento nos cultos.</p>
                                <span className="text-green-700 font-medium inline-flex items-center">Ler agora <ArrowRight className="ml-2 w-4 h-4" /></span>
                            </div>
                        </Link>

                        {/* Hymnal Card */}
                        <Link to="/hymnal" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col md:flex-row items-center gap-6 border border-gray-100 group">
                            <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Music size={32} />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Hinário Digital</h3>
                                <p className="text-gray-500 mb-4">Novo Cântico e outros hinos para o louvor congregacional. Busque por número ou título facilmente.</p>
                                <span className="text-rose-600 font-medium inline-flex items-center">Abrir Hinário <ArrowRight className="ml-2 w-4 h-4" /></span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features List */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-green-700 font-semibold tracking-wide uppercase">Para Liderança</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Administração simples e eficiente
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { title: 'Rol de Membros', desc: 'Mantenha o cadastro atualizado de todos os membros e congregados.' },
                            { title: 'Segurança de Dados', desc: 'Seus dados protegidos e acessíveis apenas por quem você autorizar.' },
                            { title: 'Multi-Igreja', desc: 'Gerencie múltiplas congregações ou pontos de pregação numa só conta.' },
                        ].map((feature, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-700 text-white mb-5">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{feature.title}</h3>
                                <p className="mt-2 text-base text-gray-500">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
