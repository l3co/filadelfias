import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
                <Link 
                    to={ROUTES.PUBLIC.HOME} 
                    className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-8"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </Link>

                <h1 className="text-3xl sm:text-4xl font-bold text-[#002333] mb-8">
                    Termos de Uso
                </h1>

                <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 space-y-8 text-gray-600 leading-relaxed">
                    <p className="text-sm text-gray-400">
                        Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e usar o aplicativo Filadélfias, você concorda com estes Termos de Uso. 
                            Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">2. Descrição do Serviço</h2>
                        <p>
                            O Filadélfias é uma plataforma gratuita e open source desenvolvida para apoiar 
                            igrejas presbiterianas na gestão de suas atividades, incluindo:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Leitura da Bíblia Sagrada</li>
                            <li>Acesso ao Hinário Novo Cântico</li>
                            <li>Devocionais e reflexões diárias</li>
                            <li>Pedidos de oração da comunidade</li>
                            <li>Diretório de membros</li>
                            <li>Gestão de eventos e EBD</li>
                            <li>Acompanhamento de missões</li>
                            <li>Registro de dízimos e ofertas</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">3. Cadastro e Conta</h2>
                        <p>
                            Para acessar determinadas funcionalidades, você precisará criar uma conta. 
                            Você é responsável por manter a confidencialidade de suas credenciais e por 
                            todas as atividades realizadas em sua conta.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">4. Uso Adequado</h2>
                        <p>Você concorda em:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Usar o serviço apenas para fins legítimos relacionados à vida eclesiástica</li>
                            <li>Não compartilhar informações falsas ou enganosas</li>
                            <li>Respeitar a privacidade dos demais membros</li>
                            <li>Não tentar acessar dados de outras igrejas ou usuários</li>
                            <li>Não utilizar o serviço para fins comerciais não autorizados</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">5. Conteúdo do Usuário</h2>
                        <p>
                            Ao enviar conteúdo (como pedidos de oração ou devocionais), você mantém seus 
                            direitos sobre esse conteúdo, mas concede ao Filadélfias uma licença para 
                            exibi-lo aos membros autorizados da sua igreja.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">6. Isenção de Garantias</h2>
                        <p>
                            O serviço é fornecido "como está", sem garantias de qualquer tipo. 
                            Não garantimos que o serviço será ininterrupto ou livre de erros.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">7. Limitação de Responsabilidade</h2>
                        <p>
                            O Filadélfias não será responsável por quaisquer danos indiretos, incidentais 
                            ou consequenciais decorrentes do uso ou impossibilidade de uso do serviço.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">8. Alterações nos Termos</h2>
                        <p>
                            Podemos atualizar estes termos periodicamente. Notificaremos sobre mudanças 
                            significativas através do aplicativo ou por e-mail.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">9. Contato</h2>
                        <p>
                            Para dúvidas sobre estes Termos de Uso, entre em contato através do 
                            e-mail: <a href="mailto:contato@filadelfias.app" className="text-green-700 hover:underline">contato@filadelfias.app</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
