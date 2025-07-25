import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao início
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Informações Gerais
              </h2>
              <p className="text-gray-700 mb-4">
                O Study Helper é um serviço que utiliza inteligência artificial 
                para ajudar na criação de resumos e questionários. Esta Política de Privacidade descreve como 
                coletamos, usamos e protegemos suas informações pessoais.
              </p>
              <p className="text-gray-700">
                <strong>Conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/18),</strong> esta política estabelece as bases legais para o tratamento de seus dados pessoais.
              </p>
              <p className="text-gray-700">
                <strong>Importante:</strong> O Study Helper oferece tanto uso anônimo (teste gratuito) quanto 
                contas registradas. O tratamento de dados varia conforme o tipo de uso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Base Legal para Tratamento de Dados
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, tratamos seus dados pessoais com base nas seguintes hipóteses legais:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Execução de contrato:</strong> Para fornecer nossos serviços</li>
                <li><strong>Legítimo interesse:</strong> Para melhorar nossos serviços e prevenir fraudes</li>
                <li><strong>Consentimento:</strong> Para comunicações de marketing (quando aplicável)</li>
                <li><strong>Cumprimento de obrigação legal:</strong> Para atender requisitos legais</li>
                <li><strong>Proteção ao crédito:</strong> Para processamento de pagamentos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Informações que Coletamos
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.1 Informações de Conta (Apenas Usuários Registrados)
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Nome e endereço de e-mail</li>
                    <li>Informações de perfil do usuário</li>
                    <li>Dados de autenticação (através do Clerk)</li>
                    <li>Histórico de uso e créditos consumidos</li>
                    <li>Informações de pagamento (através do Stripe)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.2 Conteúdo do Usuário
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Documentos e arquivos enviados para processamento</li>
                    <li>Resumos e questionários gerados</li>
                    <li>Textos e prompts inseridos no aplicativo</li>
                    <li>Hashes de conteúdo para sistema de cache (não o conteúdo em si)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.3 Dados de Uso e Analytics
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Logs de acesso e uso do aplicativo</li>
                    <li>Informações sobre dispositivos e navegadores</li>
                    <li>Dados de análise de uso e performance</li>
                    <li>Métricas de funcionalidades utilizadas</li>
                    <li>Dados de erro e debugging (sem informações pessoais)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.4 Dados de Usuários Anônimos
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Conteúdo processado temporariamente (não armazenado permanentemente)</li>
                    <li>Hashes de requisições para evitar cobranças duplicadas</li>
                    <li>Dados básicos de uso para melhorias do serviço</li>
                    <li>Informações técnicas do navegador</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Como Usamos Suas Informações
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, utilizamos seus dados para:</strong>
              </p>
              <div className="space-y-4">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Fornecer e melhorar nossos serviços de IA</li>
                  <li>Processar e gerar resumos e questionários</li>
                  <li>Gerenciar sua conta e autenticação (usuários registrados)</li>
                  <li>Enviar comunicações sobre o serviço</li>
                  <li>Analisar e otimizar o desempenho do aplicativo</li>
                  <li>Cumprir obrigações legais</li>
                  <li>Implementar sistema de cache para otimização</li>
                  <li>Prevenir uso abusivo e fraudes</li>
                  <li>Melhorar a experiência do usuário</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Compartilhamento de Informações
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Com provedores de serviços que nos ajudam a operar o aplicativo (Clerk, Supabase, Stripe)</li>
                <li>Com serviços de IA para processamento de conteúdo (OpenAI)</li>
                <li>Quando exigido por lei ou para proteger nossos direitos</li>
                <li>Com seu consentimento explícito</li>
                <li>Com serviços de análise para melhorar nosso produto (dados anonimizados)</li>
              </ul>
              <p className="text-gray-700">
                <strong>Todos os terceiros são obrigados a manter a confidencialidade e segurança dos dados.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Sistema de Cache e Otimização
              </h2>
              <p className="text-gray-700">
                Para otimizar o serviço e evitar cobranças duplicadas, implementamos um sistema de cache:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Hashes de conteúdo são gerados para identificar requisições idênticas</li>
                <li>Requisições duplicadas retornam resultados em cache sem consumir créditos</li>
                <li>Dados de cache são mantidos por período limitado</li>
                <li>Hashes não contêm o conteúdo original, apenas identificadores únicos</li>
                <li>Cache é limpo automaticamente para preservar privacidade</li>
              </ul>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, o sistema de cache opera com base no legítimo interesse de otimização do serviço.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Segurança dos Dados
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Autenticação segura através do Clerk</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares e seguros</li>
                <li>Processamento temporário para usuários anônimos</li>
                <li>Limpeza automática de dados sensíveis</li>
                <li>Auditoria regular de segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Retenção de Dados
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, mantemos suas informações apenas pelo tempo necessário para:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Fornecer nossos serviços</li>
                <li>Cumprir obrigações legais</li>
                <li>Resolver disputas</li>
                <li>Fazer cumprir nossos acordos</li>
              </ul>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Retenção por Tipo de Usuário</h3>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li><strong>Usuários Registrados:</strong> Dados mantidos até exclusão da conta ou 5 anos após último acesso</li>
                <li><strong>Usuários Anônimos:</strong> Conteúdo processado temporariamente, não armazenado permanentemente</li>
                <li><strong>Dados de Cache:</strong> Mantidos por período limitado para otimização (máximo 30 dias)</li>
                <li><strong>Logs de Sistema:</strong> Mantidos por período necessário para operação e segurança (máximo 2 anos)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Você pode solicitar a exclusão de seus dados a qualquer momento através das configurações da conta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Seus Direitos (LGPD)
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, você tem os seguintes direitos relacionados aos seus dados pessoais:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Confirmação da existência de tratamento:</strong> Verificar se tratamos seus dados</li>
                <li><strong>Acesso:</strong> Solicitar uma cópia de seus dados pessoais</li>
                <li><strong>Correção:</strong> Solicitar correção de dados imprecisos, incompletos ou desatualizados</li>
                <li><strong>Anonimização, bloqueio ou eliminação:</strong> Solicitar a exclusão de seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
                <li><strong>Oposição:</strong> Opor-se ao tratamento de seus dados</li>
                <li><strong>Revogação do consentimento:</strong> Revogar consentimento a qualquer momento</li>
                <li><strong>Revisão de decisões automatizadas:</strong> Contestar decisões tomadas unicamente com base em tratamento automatizado</li>
              </ul>
              <p className="text-gray-700">
                <strong>Nota:</strong> Para usuários anônimos, alguns direitos podem ser limitados 
                devido à natureza temporária do processamento de dados.
              </p>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Como Exercer Seus Direitos</h3>
              <p className="text-yellow-800">
                Para exercer seus direitos, entre em contato conosco através do e-mail: studyhelpersuporte@gmail.com
              </p>
              <p className="text-yellow-800 mt-2">
                <strong>Prazo de resposta:</strong> 15 dias, conforme LGPD.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Cookies e Tecnologias Similares
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, utilizamos cookies e tecnologias similares para:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Manter sua sessão ativa</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar o uso do aplicativo</li>
                <li>Melhorar a experiência do usuário</li>
                <li>Implementar sistema de cache</li>
                <li>Prevenir uso abusivo</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Serviços de Terceiros
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, utilizamos os seguintes serviços de terceiros:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Clerk:</strong> Autenticação e gerenciamento de usuários</li>
                <li><strong>Supabase:</strong> Banco de dados e armazenamento</li>
                <li><strong>Stripe:</strong> Processamento de pagamentos</li>
                <li><strong>OpenAI:</strong> Processamento de IA e geração de conteúdo</li>
                <li><strong>Vercel:</strong> Hospedagem e infraestrutura</li>
                <li><strong>Serviços de Analytics:</strong> Análise de uso e performance (dados anonimizados)</li>
              </ul>
              <p className="text-gray-700">
                <strong>Todos os terceiros são obrigados a cumprir a LGPD e manter a segurança dos dados.</strong>
              </p>
              <p className="text-gray-700 mt-4">
                Cada serviço tem sua própria política de privacidade que recomendamos que você leia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Menores de Idade
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD e o Código Civil:</strong>
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Usuários Maiores de 18 Anos</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Podem usar o serviço sem restrições</li>
                    <li>São responsáveis por todas as atividades em sua conta</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Usuários Entre 16 e 18 Anos</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Podem usar o serviço com capacidade relativa</li>
                    <li>Devem ter autorização parental para pagamentos</li>
                    <li>Responsabilidade subsidiária dos pais/responsáveis</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Usuários Menores de 16 Anos</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Podem usar apenas o teste gratuito anônimo</li>
                    <li>Não podem criar contas registradas</li>
                    <li>Não podem realizar pagamentos</li>
                    <li>Dados são processados apenas temporariamente</li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-700">
                <strong>Nosso serviço não é destinado a menores de 13 anos. Não coletamos intencionalmente 
                informações pessoais de menores de 13 anos.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Transferências Internacionais
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, suas informações podem ser transferidas e processadas em países diferentes do seu país de residência.</strong>
              </p>
              <p className="text-gray-700">
                Garantimos que essas transferências sejam feitas de acordo com as leis de proteção de dados aplicáveis 
                e que os países de destino ofereçam grau de proteção adequado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Alterações nesta Política
              </h2>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, podemos atualizar esta Política de Privacidade periodicamente.</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Notificaremos você sobre mudanças significativas através do aplicativo ou por e-mail com antecedência mínima de 30 dias.
              </p>
              <p className="text-gray-700">
                Recomendamos que você revise esta política regularmente.
              </p>
              <p className="text-gray-700">
                <strong>Você tem o direito de rescindir o contrato sem penalidades se não concordar com as modificações.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Contato e Encarregado de Dados (DPO)
              </h2>
              <p className="text-gray-700 mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos 
                suas informações pessoais, entre em contato conosco:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>E-mail:</strong> studyhelpersuporte@gmail.com<br />
                </p>
              </div>
              <p className="text-gray-700">
                <strong>Conforme a LGPD, você também pode:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                  <li>Entrar em contato com a Autoridade Nacional de Proteção de Dados (ANPD)</li>
                  <li>Recorrer aos órgãos de defesa do consumidor (PROCON)</li>
                  <li>Buscar orientação junto ao Ministério Público</li>
                </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                16. Lei Aplicável
              </h2>
              <p className="text-gray-700">
                <strong>Esta Política de Privacidade é regida pela LGPD (Lei 13.709/18) e demais leis brasileiras aplicáveis.</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Qualquer disputa relacionada a esta política será resolvida nos tribunais brasileiros.
              </p>
              <p className="text-gray-700">
                <strong>Foro competente:</strong> Comarca do domicílio do titular dos dados, conforme art. 63 do Código de Defesa do Consumidor.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Esta política de privacidade foi criada para proteger seus direitos e explicar 
              como cuidamos de suas informações pessoais no Study Helper, em conformidade com a LGPD e demais leis brasileiras aplicáveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 