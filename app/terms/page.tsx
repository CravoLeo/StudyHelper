import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
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
              Termos de Serviço
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 mb-4">
                Ao acessar e usar o Study Helper ("Serviço"), você concorda em cumprir e estar vinculado 
                a estes Termos de Serviço ("Termos"). Se você não concordar com qualquer parte destes 
                termos, não deve usar nosso Serviço.
              </p>
              <p className="text-gray-700">
                <strong>Conforme o Código de Defesa do Consumidor (Lei 8.078/90),</strong> estes termos constituem um contrato de adesão.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="text-gray-700 mb-4">
                O Study Helper é uma plataforma que utiliza inteligência artificial para ajudar na 
                criação de resumos e questionários. Nossos serviços incluem:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Geração automática de resumos a partir de documentos</li>
                <li>Criação de questionários baseados em conteúdo</li>
                <li>Processamento de texto usando IA</li>
                <li>Armazenamento seguro de documentos e resultados</li>
                <li>Extração de texto de arquivos PDF</li>
                <li>Suporte a múltiplos idiomas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Capacidade Civil e Uso por Menores
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Conforme o Código Civil (Lei 10.406/02):</strong>
                </p>
                
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
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Uso Anônimo (Teste Gratuito)</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Permite 1 uso gratuito sem necessidade de cadastro</li>
                    <li>Dados são processados temporariamente e não são armazenados permanentemente</li>
                    <li>Funcionalidades limitadas comparadas ao uso registrado</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Conta Registrada</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>3 usos gratuitos mensais</li>
                    <li>Armazenamento de documentos e histórico</li>
                    <li>Acesso a todos os recursos do serviço</li>
                    <li>Possibilidade de upgrade para planos pagos</li>
                  </ul>
                </div>
                
                <p className="text-gray-700">
                  Para contas registradas, você é responsável por:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Manter a confidencialidade de suas credenciais de login</li>
                  <li>Todas as atividades que ocorrem em sua conta</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                  <li>Fornecer informações precisas e atualizadas</li>
                </ul>
                <p className="text-gray-700">
                  Reservamo-nos o direito de encerrar contas que violem estes termos.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Limites de Uso e Restrições
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Limites de Arquivo</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Tamanho máximo: 4.5MB por arquivo</li>
                    <li>Formatos suportados: PDF (recomendado), imagens JPG/PNG</li>
                    <li>Arquivos devem conter texto legível (não apenas imagens escaneadas)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Sistema de Cache</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Requisições idênticas não consomem créditos adicionais</li>
                    <li>Cache é mantido por um período limitado para otimização</li>
                    <li>Dados de cache são processados de forma segura e anônima</li>
                  </ul>
                </div>
                <p className="text-gray-700">
                  Você concorda em usar o Serviço apenas para propósitos legais e de acordo com estes Termos. 
                  Você não deve:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Usar o Serviço para atividades ilegais ou fraudulentas</li>
                  <li>Violar direitos de propriedade intelectual</li>
                  <li>Enviar conteúdo malicioso, spam ou vírus</li>
                  <li>Tentar acessar sistemas não autorizados</li>
                  <li>Interferir no funcionamento do Serviço</li>
                  <li>Usar o Serviço para plagiar ou violar direitos autorais</li>
                  <li>Compartilhar conteúdo ofensivo, difamatório ou inadequado</li>
                  <li>Contornar limites de uso através de múltiplas contas</li>
                  <li>Usar o serviço para processamento em massa sem autorização</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Conteúdo do Usuário
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Conforme o Código Civil, você mantém a propriedade do conteúdo que envia para o Serviço.</strong>
                </p>
                <p className="text-gray-700">
                  Ao usar nossos serviços, você nos concede uma licença limitada para:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Processar seu conteúdo para fornecer nossos serviços</li>
                  <li>Armazenar seu conteúdo de forma segura (apenas para usuários registrados)</li>
                  <li>Melhorar nossos algoritmos de IA (sem identificar você)</li>
                  <li>Implementar sistema de cache para otimização de performance</li>
                </ul>
                <p className="text-gray-700">
                  Você garante que tem direitos sobre o conteúdo enviado e que não viola direitos 
                  de terceiros.
                </p>
                <p className="text-gray-700">
                  <strong>Importante:</strong> Para usuários anônimos, o conteúdo não é armazenado 
                  permanentemente e é processado apenas para gerar resumos e questionários.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Propriedade Intelectual
              </h2>
              <p className="text-gray-700 mb-4">
                O Study Helper e todo o conteúdo relacionado (incluindo, mas não se limitando a, 
                software, design, textos, gráficos, logos) são propriedade nossa ou de nossos 
                licenciadores e estão protegidos por leis de propriedade intelectual.
              </p>
              <p className="text-gray-700">
                Você não pode copiar, modificar, distribuir, vender ou criar trabalhos derivados 
                sem nossa permissão expressa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Pagamentos e Assinaturas
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  O Study Helper oferece diferentes planos de pagamento:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Gratuito:</strong> 3 usos mensais para usuários registrados</li>
                  <li><strong>Individual:</strong> Compra única de créditos adicionais</li>
                  <li><strong>Starter/Pro:</strong> Pacotes de créditos com desconto</li>
                  <li><strong>Unlimited:</strong> Assinatura mensal com uso ilimitado</li>
                </ul>
                <p className="text-gray-700">
                  <strong>Conforme o Código de Defesa do Consumidor:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Preços são cobrados antecipadamente</li>
                  <li>Assinaturas são renovadas automaticamente</li>
                  <li>Você pode cancelar a qualquer momento</li>
                  <li>Reembolsos são avaliados caso a caso</li>
                  <li>Preços podem ser alterados com aviso prévio de 30 dias</li>
                  <li>Créditos não utilizados podem expirar conforme política específica do plano</li>
                  <li><strong>Direito de arrependimento de 7 dias para compras online</strong></li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Responsabilidade por Pagamentos</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Usuários menores de 18 anos precisam de autorização parental</li>
                    <li>Responsabilidade subsidiária dos pais/responsáveis por pagamentos de menores</li>
                    <li>Direito de contestação de cobranças indevidas</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Limitação de Responsabilidade
              </h2>
              <p className="text-gray-700 mb-4">
                <strong>Conforme o Código Civil e Código de Defesa do Consumidor:</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Em nenhuma circunstância o Study Helper será responsável por:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Danos indiretos, incidentais ou consequenciais</li>
                <li>Perda de dados ou conteúdo do usuário</li>
                <li>Interrupções do serviço</li>
                <li>Uso inadequado do conteúdo gerado</li>
                <li>Violations de direitos autorais por parte do usuário</li>
                <li>Falhas na extração de texto de documentos mal formatados</li>
                <li>Imprecisões na geração de resumos ou questionários</li>
                <li>Perda de dados para usuários anônimos</li>
              </ul>
              <p className="text-gray-700">
                Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Exceções à Limitação</h3>
                <p className="text-gray-700">
                  A limitação de responsabilidade não se aplica a danos causados por dolo ou culpa grave, 
                  violações de direitos do consumidor, ou danos morais comprovados.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Disponibilidade do Serviço
              </h2>
              <p className="text-gray-700 mb-4">
                Nos esforçamos para manter o Serviço disponível 24/7, mas não garantimos disponibilidade 
                contínua. Podemos realizar manutenção programada ou enfrentar interrupções técnicas.
              </p>
              <p className="text-gray-700">
                <strong>Conforme o Código de Defesa do Consumidor,</strong> não somos responsáveis por 
                perdas resultantes de indisponibilidade do serviço, exceto em caso de dolo ou culpa grave.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Privacidade
              </h2>
              <p className="text-gray-700 mb-4">
                Sua privacidade é importante para nós. O uso de suas informações pessoais é regido 
                por nossa Política de Privacidade, que faz parte destes Termos.
              </p>
              <p className="text-gray-700">
                <strong>Conforme a LGPD (Lei 13.709/18),</strong> você tem direitos específicos sobre seus dados pessoais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Rescisão
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Rescisão pelo Usuário</h3>
                  <p className="text-gray-700">Você pode encerrar sua conta a qualquer momento.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Rescisão pelo Study Helper</h3>
                  <p className="text-gray-700">
                    Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, por violação destes Termos.
                  </p>
                </div>
                <p className="text-gray-700">
                  <strong>Conforme o Código de Defesa do Consumidor,</strong> a rescisão deve ser comunicada 
                  com antecedência mínima de 30 dias, exceto em caso de violação grave dos termos.
                </p>
                <p className="text-gray-700">
                  Após a rescisão, você perderá acesso ao Serviço e seus dados podem ser excluídos 
                  conforme nossa Política de Privacidade.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Modificações dos Termos
              </h2>
              <p className="text-gray-700 mb-4">
                <strong>Conforme o Código de Defesa do Consumidor:</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Podemos modificar estes Termos a qualquer momento. Mudanças significativas serão 
                notificadas através do aplicativo ou por e-mail com antecedência mínima de 30 dias.
              </p>
              <p className="text-gray-700">
                O uso contínuo do Serviço após as modificações constitui aceitação dos novos termos.
              </p>
              <p className="text-gray-700">
                <strong>Você tem o direito de rescindir o contrato sem penalidades se não concordar com as modificações.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Lei Aplicável e Foro
              </h2>
              <p className="text-gray-700 mb-4">
                <strong>Conforme o Código Civil e Código de Defesa do Consumidor:</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Estes Termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida 
                nos tribunais brasileiros.
              </p>
              <p className="text-gray-700">
                <strong>Foro competente:</strong> Comarca do domicílio do consumidor, conforme art. 63 do Código de Defesa do Consumidor.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Disposições Gerais
              </h2>
              <div className="space-y-4">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Estes Termos constituem o acordo completo entre você e o Study Helper</li>
                  <li>Se qualquer disposição for inválida, as demais permanecerão em vigor</li>
                  <li>Nossa falha em fazer cumprir qualquer direito não constitui renúncia</li>
                  <li>Você não pode transferir seus direitos sob estes Termos</li>
                </ul>
                <p className="text-gray-700">
                  <strong>Conforme o Código Civil, cláusulas abusivas são consideradas nulas de pleno direito.</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Contato
              </h2>
              <p className="text-gray-700 mb-4">
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>E-mail:</strong> studyhelpersuporte@gmail.com<br /> 
                </p>
              </div>
              <p className="text-gray-700">
                <strong>Conforme o Código de Defesa do Consumidor,</strong> você também pode recorrer aos 
                órgãos de defesa do consumidor (PROCON) em caso de disputas.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Estes termos de serviço estabelecem as regras e responsabilidades para o uso 
              seguro e adequado do Study Helper, em conformidade com o Código Civil, Código de Defesa do Consumidor e demais leis brasileiras aplicáveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 