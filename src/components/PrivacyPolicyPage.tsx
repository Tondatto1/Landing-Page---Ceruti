import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="bg-[#00a83e] p-1.5 rounded-lg group-hover:bg-[#008f34] transition-colors">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-sans font-black text-2xl tracking-tight text-[#0c1f22] uppercase">Ceruti</span>
          </Link>
          <Link to="/" className="flex items-center text-sm font-bold text-neutral-500 hover:text-[#0c1f22] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 p-8 sm:p-12">
          <h1 className="text-3xl font-black text-[#0c1f22] mb-8">Política de Privacidade</h1>
          
          <div className="space-y-6 text-neutral-600 font-medium text-sm leading-relaxed">
             <p>A <strong>Ceruti</strong> valoriza a conformidade e a proteção dos seus dados pessoais. Esta Política de Privacidade foi elaborada em estrita observância à Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e dispõe sobre a coleta, utilização, tratamento e armazenamento das informações dos usuários do nosso agente de inteligência de vendas (Ceruti AI) via WhatsApp e da nossa plataforma online.</p>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">1. Definições Iniciais</h2>
             <p>Para fins desta Política, considera-se: <strong>Titular dos Dados</strong>: pessoa natural a quem se referem os dados pessoais que são objeto de tratamento; <strong>Controlador</strong>: Ceruti, a quem competem as decisões referentes ao tratamento de dados pessoais; <strong>Tratamento</strong>: toda operação realizada com dados pessoais.</p>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">2. Dados Pessoais Coletados</h2>
             <p>Coletamos os seguintes dados para execução do contrato ou para diligências pré-contratuais, nos termos do art. 7º, V, da LGPD:</p>
             <ul className="list-disc pl-5 space-y-2">
               <li><strong>Dados Cadastrais e Profissionais:</strong> Nome completo, e-mail, número do WhatsApp, CPF/CNPJ, cargo e informações da empresa.</li>
               <li><strong>Dados de Pagamento:</strong> Informações de faturamento processadas por gateways de pagamento terceirizados (não armazenamos dados integrais de cartão de crédito em nossos servidores).</li>
               <li><strong>Dados de Uso e Interação (Conteúdo):</strong> Mensagens de texto, áudio e metadados trocados com o nosso Agente via WhatsApp, estritamente para o funcionamento e aprimoramento do modelo.</li>
             </ul>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">3. Finalidade e Base Legal</h2>
             <p>De acordo com o art. 7º da LGPD, utilizamos os dados fundamentados nas seguintes bases legais:</p>
             <ul className="list-disc pl-5 space-y-2">
               <li><strong>Execução de Contrato:</strong> Para fornecer a inteligência de vendas e o acesso contratado ao nosso sistema.</li>
               <li><strong>Legítimo Interesse:</strong> Para análise de interações com o intuito exclusivo de aprimorar a capacidade de conversão e assertividade da base de conhecimento da Inteligência Artificial.</li>
               <li><strong>Obrigação Legal:</strong> Para guarda de registros de acesso sob o Marco Civil da Internet (Lei nº 12.965/2014) e documentação fiscal.</li>
             </ul>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">4. Compartilhamento de Dados com Terceiros</h2>
             <p>Nós não comercializamos ou cedemos as suas listas de leads ou conversas para outras empresas para fim publicitário. Os dados podem ser processados por terceiros essenciais à operação ("Operadores"), mediante contratos com cláusulas rigorosas de confidencialidade:</p>
             <ul className="list-disc pl-5 space-y-2">
               <li>Provedores de LLMs (Large Language Models) utilizados unicamente como motor neural de respotas (não usam os dados para treinamento público).</li>
               <li>Provedores de infraestrutura e hospedagem de servidores em nuvem (ex: AWS, Google Cloud).</li>
               <li>Parceiros oficiais de API do WhatsApp (Business Solution Providers).</li>
             </ul>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">5. Armazenamento e Segurança da Informação</h2>
             <p>A Ceruti adota medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração ou comunicação. Os dados são mantidos pelo tempo necessário ao cumprimento das finalidades descritas, limitando-se aos prazos prescricionais legais.</p>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">6. Direitos do Titular (Art. 18 da LGPD)</h2>
             <p>O titular tem direito de obter, mediante requisição: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização ou eliminação de dados desnecessários, e a revogação do consentimento (quando aplicável). Para exercer, contate nosso DPO ou suporte oficial.</p>
             
             <p className="mt-8 pt-6 border-t border-neutral-100 text-xs text-neutral-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
