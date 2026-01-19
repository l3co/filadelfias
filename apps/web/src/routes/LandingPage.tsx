import { Link } from 'react-router-dom';
import { BookOpen, Music, Book, CheckCircle, Wallet, Users, GraduationCap, Gavel, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export function LandingPage() {
    return (
        <div className="flex flex-col w-full animate-in fade-in duration-700">

            {/* Hero Section - 3 Big Cards with Inviting Title */}
            <section className="bg-white py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-6">
                            Vamos ler a Palavra de Deus hoje?
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-500">
                            Acesse os recursos de edificação de forma rápida e simples.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Bíblia */}
                        <Link to="/bible" className="group">
                            <Card className="h-full border-2 border-transparent hover:border-green-100 transition-all hover:shadow-lg">
                                <CardContent className="flex flex-col items-center p-8 text-center h-full justify-center space-y-6">
                                    <div className="p-4 bg-green-50 text-green-700 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen size={48} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-gray-900">Bíblia</h2>
                                        <p className="text-gray-500">Leitura das Escrituras Sagradas de forma simples e direta.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Hinário */}
                        <Link to="/hymnal" className="group">
                            <Card className="h-full border-2 border-transparent hover:border-green-100 transition-all hover:shadow-lg">
                                <CardContent className="flex flex-col items-center p-8 text-center h-full justify-center space-y-6">
                                    <div className="p-4 bg-green-50 text-green-700 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <Music size={48} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-gray-900">Hinário</h2>
                                        <p className="text-gray-500">Novo Cântico e hinos tradicionais para louvor congregacional.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Manual (Future link) */}
                        <div className="group cursor-not-allowed opacity-80">
                            <Card className="h-full border-2 border-transparent hover:border-gray-100 transition-all hover:shadow-md bg-gray-50">
                                <CardContent className="flex flex-col items-center p-8 text-center h-full justify-center space-y-6">
                                    <div className="p-4 bg-gray-200 text-gray-500 rounded-full">
                                        <Book size={48} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-gray-900">Manual</h2>
                                        <p className="text-gray-500">Manual Presbiteriano e documentos oficiais. (Em breve)</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* O Que é o Projeto (Moved down) */}
            <section className="py-20 bg-green-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        O que é o Projeto Filadélfia?
                    </h2>
                    <p className="text-lg text-green-50 leading-relaxed">
                        O Projeto Filadélfia é uma iniciativa gratuita e de código aberto (open source), desenvolvida com o intuito de apoiar a Igreja de Cristo. Utilizamos a tecnologia como ferramenta de transformação e auxílio no dia a dia de pastores, oficiais e membros. Seja para leitura da Palavra, cânticos ou gestão eclesiástica, nosso foco é servir com excelência e simplicidade, para a Glória de Deus.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-green-700 font-semibold tracking-wide uppercase">Funcionalidades</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Conheça algumas funcionalidades que a plataforma possui
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Tudo integrado em um só lugar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            {
                                title: 'Financeiro',
                                desc: 'Gestão de entradas, saídas, dízimos e relatórios de tesouraria transparentes.',
                                icon: Wallet,
                                color: 'text-green-700',
                                bg: 'bg-green-50'
                            },
                            {
                                title: 'Membros',
                                desc: 'Rol de membros completo, com histórico, dados familiares e eclesiásticos.',
                                icon: Users,
                                color: 'text-green-700',
                                bg: 'bg-green-50'
                            },
                            {
                                title: 'Educação Cristã (EBD)',
                                desc: 'Gestão de classes, professores, alunos e currículo para Escola Bíblica.',
                                icon: GraduationCap,
                                color: 'text-green-700',
                                bg: 'bg-green-50'
                            },
                            {
                                title: 'Governança',
                                desc: 'Organização de conselhos, atas, assembleias e documentos oficiais.',
                                icon: Gavel,
                                color: 'text-green-700',
                                bg: 'bg-green-50'
                            },
                            {
                                title: 'Missões',
                                desc: 'Acompanhamento de missionários, campos e projetos evangelísticos.',
                                icon: Globe,
                                color: 'text-green-700',
                                bg: 'bg-green-50'
                            },
                            {
                                title: 'Eventos',
                                desc: 'Calendário da igreja, escalas e avisos importantes. (Em desenvolvimento)',
                                icon: CheckCircle,
                                color: 'text-gray-600',
                                bg: 'bg-gray-100'
                            }
                        ].map((feature, i) => (
                            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-lg ${feature.bg} ${feature.color} flex items-center justify-center mb-4`}>
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cadastre sua Igreja Section */}
            <section className="bg-white py-16 sm:py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gray-900 rounded-3xl p-12 sm:p-20 shadow-2xl relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-600 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-green-500 blur-3xl"></div>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Leve a Filadélfia para sua comunidade
                        </h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Cadastre sua igreja hoje mesmo e comece a usar todas as ferramentas de gestão e edificação disponíveis na plataforma.
                        </p>
                        <div className="pt-4">
                            <Link to="/onboarding">
                                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                                    Cadastre sua Igreja
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
