import { Link } from 'react-router-dom';
import { BookOpen, Music, Book, Wallet, Users, GraduationCap, Gavel, Globe, Calendar, ChevronRight, Sparkles, Church } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const features = [
    {
        title: 'Financeiro',
        desc: 'Gestão de entradas, saídas, dízimos e relatórios de tesouraria transparentes.',
        icon: Wallet,
        available: true
    },
    {
        title: 'Membros',
        desc: 'Rol de membros completo, com histórico, dados familiares e eclesiásticos.',
        icon: Users,
        available: true
    },
    {
        title: 'Educação Cristã',
        desc: 'Gestão de classes, professores, alunos e currículo para Escola Bíblica.',
        icon: GraduationCap,
        available: true
    },
    {
        title: 'Governança',
        desc: 'Organização de conselhos, atas, assembleias e documentos oficiais.',
        icon: Gavel,
        available: true
    },
    {
        title: 'Missões',
        desc: 'Acompanhamento de missionários, campos e projetos evangelísticos.',
        icon: Globe,
        available: true
    },
    {
        title: 'Eventos',
        desc: 'Calendário da igreja, escalas e avisos importantes.',
        icon: Calendar,
        available: false
    }
];

export function LandingPage() {
    return (
        <div className="flex flex-col w-full">

            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-white via-white to-[#DEEFE7]/30 py-20 sm:py-32 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 sm:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-green-100">
                            <Sparkles size={16} />
                            <span>Plataforma gratuita e open source</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#002333] tracking-tight mb-6 leading-tight">
                            Vamos ler a{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                                Palavra de Deus
                            </span>
                            {' '}hoje?
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 leading-relaxed">
                            Acesse recursos de edificação espiritual de forma rápida, simples e elegante.
                        </p>
                    </div>

                    {/* Main Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                        {/* Bíblia */}
                        <Link to="/bible" className="group">
                            <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-200/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="relative flex flex-col items-center p-10 text-center h-full justify-center space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                                        <div className="relative p-5 bg-gradient-to-br from-green-50 to-green-100 text-green-700 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                            <BookOpen size={40} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-bold text-[#002333]">Bíblia Sagrada</h2>
                                        <p className="text-gray-500 leading-relaxed">Leitura das Escrituras de forma simples e direta.</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Acessar</span>
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Hinário */}
                        <Link to="/hymnal" className="group">
                            <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-200/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="relative flex flex-col items-center p-10 text-center h-full justify-center space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                                        <div className="relative p-5 bg-gradient-to-br from-green-50 to-green-100 text-green-700 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                            <Music size={40} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-bold text-[#002333]">Hinário</h2>
                                        <p className="text-gray-500 leading-relaxed">Novo Cântico e hinos tradicionais para louvor.</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Acessar</span>
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Manual */}
                        <Link to="/manual" className="group">
                            <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-green-200/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="relative flex flex-col items-center p-10 text-center h-full justify-center space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                                        <div className="relative p-5 bg-gradient-to-br from-green-50 to-green-100 text-green-700 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                            <Book size={40} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-bold text-[#002333]">Manual</h2>
                                        <p className="text-gray-500 leading-relaxed">Manual Presbiteriano e documentos oficiais.</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Acessar</span>
                                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] rounded-3xl p-10 sm:p-16 text-white overflow-hidden shadow-2xl">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative text-center space-y-8 max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                O que é o Projeto Filadélfia?
                            </h2>
                            
                            <blockquote className="text-lg sm:text-xl text-green-100/90 leading-relaxed italic border-l-4 border-green-500 pl-6 text-left">
                                "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho."
                                <footer className="text-green-300 text-base mt-2 not-italic font-medium">— Salmo 119:105</footer>
                            </blockquote>
                            
                            <p className="text-lg text-green-50/80 leading-relaxed">
                                Uma iniciativa <strong className="text-white">gratuita e open source</strong>, desenvolvida para apoiar a Igreja de Cristo. 
                                Utilizamos tecnologia como ferramenta de transformação no dia a dia de pastores, oficiais e membros. 
                                Nosso foco é servir com excelência e simplicidade, para a Glória de Deus.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block text-green-700 font-semibold tracking-wider uppercase text-sm mb-4">
                            Funcionalidades
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002333] tracking-tight mb-4">
                            Tudo que sua igreja precisa
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-gray-500">
                            Uma plataforma completa, integrada e fácil de usar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <Card 
                                key={i} 
                                className={`group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                                    feature.available 
                                        ? 'bg-white hover:-translate-y-1' 
                                        : 'bg-gray-50 opacity-75'
                                }`}
                            >
                                <div className={`h-1 ${feature.available ? 'bg-gradient-to-r from-green-600 to-teal-500' : 'bg-gray-200'}`} />
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${
                                            feature.available 
                                                ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <feature.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className={`text-lg font-bold ${feature.available ? 'text-[#002333]' : 'text-gray-400'}`}>
                                                    {feature.title}
                                                </h3>
                                                {!feature.available && (
                                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-xs font-medium rounded-full">
                                                        Em breve
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm leading-relaxed ${feature.available ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 sm:py-28">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative text-center bg-[#002333] rounded-3xl p-12 sm:p-20 overflow-hidden shadow-2xl">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-600/20 blur-3xl" />
                            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-transparent via-green-500/5 to-transparent" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600/20 text-green-400 mb-4">
                                <Church size={32} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                                Leve a Filadélfia para sua comunidade
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                Cadastre sua igreja e comece a usar todas as ferramentas de gestão e edificação disponíveis gratuitamente.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link to="/register">
                                    <Button 
                                        size="lg" 
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-7 text-lg rounded-2xl shadow-xl shadow-green-900/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
                                    >
                                        <Church className="mr-2" size={20} />
                                        Cadastre sua Igreja
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button 
                                        variant="ghost" 
                                        size="lg"
                                        className="text-gray-300 hover:text-white hover:bg-white/10 px-8 py-7 text-lg rounded-2xl transition-all duration-300"
                                    >
                                        Já tenho conta
                                        <ChevronRight className="ml-1" size={18} />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#002333] text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold mb-2">Filadélfias</h3>
                            <p className="text-gray-400 text-sm">
                                Plataforma gratuita e open source para igrejas presbiterianas.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                                Termos de Uso
                            </Link>
                            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                Política de Privacidade
                            </Link>
                            <a 
                                href="mailto:contato@filadelfias.app" 
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Contato
                            </a>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} Projeto Filadélfia. Soli Deo Gloria.
                    </div>
                </div>
            </footer>
        </div>
    );
}
