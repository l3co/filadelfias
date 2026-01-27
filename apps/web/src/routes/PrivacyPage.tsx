import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-8"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </Link>

                <h1 className="text-3xl sm:text-4xl font-bold text-[#002333] mb-8">
                    Política de Privacidade
                </h1>

                <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 space-y-8 text-gray-600 leading-relaxed">
                    <p className="text-sm text-gray-400">
                        Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">1. Introdução</h2>
                        <p>
                            O Filadélfias respeita sua privacidade e está comprometido em proteger seus dados pessoais. 
                            Esta política descreve como coletamos, usamos e protegemos suas informações.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">2. Dados que Coletamos</h2>
                        <p>Coletamos os seguintes tipos de informações:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone</li>
                            <li><strong>Dados eclesiásticos:</strong> igreja, ofício, funções</li>
                            <li><strong>Dados de uso:</strong> interações com o aplicativo</li>
                            <li><strong>Conteúdo gerado:</strong> pedidos de oração, devocionais</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">3. Como Usamos seus Dados</h2>
                        <p>Utilizamos suas informações para:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Fornecer e manter nossos serviços</li>
                            <li>Permitir a comunicação entre membros da mesma igreja</li>
                            <li>Enviar notificações relevantes sobre atividades da igreja</li>
                            <li>Melhorar a experiência do usuário</li>
                            <li>Garantir a segurança da plataforma</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">4. Compartilhamento de Dados</h2>
                        <p>
                            Seus dados são compartilhados apenas com membros autorizados da sua igreja, 
                            conforme as permissões definidas pela liderança eclesiástica. 
                            <strong> Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.</strong>
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">5. Segurança dos Dados</h2>
                        <p>
                            Implementamos medidas de segurança técnicas e organizacionais para proteger 
                            seus dados, incluindo:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Criptografia de dados em trânsito (HTTPS)</li>
                            <li>Armazenamento seguro com acesso restrito</li>
                            <li>Autenticação segura</li>
                            <li>Separação de dados por igreja (multi-tenant)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">6. Seus Direitos</h2>
                        <p>De acordo com a LGPD, você tem direito a:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Acessar seus dados pessoais</li>
                            <li>Corrigir dados incompletos ou desatualizados</li>
                            <li>Solicitar a exclusão de seus dados</li>
                            <li>Revogar seu consentimento a qualquer momento</li>
                            <li>Solicitar a portabilidade dos dados</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">7. Retenção de Dados</h2>
                        <p>
                            Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário 
                            para fornecer nossos serviços. Você pode solicitar a exclusão de sua conta 
                            a qualquer momento.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">8. Cookies e Tecnologias Similares</h2>
                        <p>
                            Utilizamos cookies essenciais para o funcionamento do aplicativo, como 
                            manutenção de sessão e preferências do usuário. Não utilizamos cookies 
                            de rastreamento ou publicidade.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">9. Alterações nesta Política</h2>
                        <p>
                            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
                            significativas através do aplicativo ou por e-mail.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-[#002333]">10. Contato</h2>
                        <p>
                            Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                            entre em contato através do e-mail: {' '}
                            <a href="mailto:privacidade@filadelfias.app" className="text-green-700 hover:underline">
                                privacidade@filadelfias.app
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
