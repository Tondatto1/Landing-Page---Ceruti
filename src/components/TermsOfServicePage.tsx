import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsOfServicePage() {
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
          <h1 className="text-3xl font-black text-[#0c1f22] mb-8">Termos e Condições de Uso</h1>
          
          <div className="space-y-6 text-neutral-600 font-medium text-sm leading-relaxed">
             <p>Este instrumento (“Termos de Serviço”) contém as regras que estabelecem o uso dos serviços oferecidos pela <strong>Ceruti</strong>, empresa criadora do modelo de agente de Inteligência Artificial para treinamento comercial autônomo via WhatsApp e plataforma online. Ao contratar os nossos planos e serviços, o "Contratante" aceita legalmente e incondicionalmente estes termos.</p>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">1. Natureza do Serviço</h2>
             <p>A Ceruti oferece um software como serviço (SaaS). Trata-se de uma inteligência artificial conversacional acessada via aplicativo WhatsApp e painéis web aplicáveis. Entregamos a sistematização de metodologias de vendas e a atuação em Role-Play (treinamento) contínuo, a fim de aumentar o fechamento de vendas de equipes do agronegócio e de outros perfis atendidos.</p>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">2. Licença e Restrições de Direitos Autorais</h2>
             <p>A presente contratação concede apenas o direito de uso "não-exclusivo", intransferível e irrevogável, limitado pelos planos e pelas quantidades de números autorizados ("Acessos"). Todos os direitos de propriedade intelectual sobre os algoritmos, interfaces, os Prompts bases (A Engenharia da IA) da Ceruti pertencem exclusivamente aos seus desenvolvedores originais.</p>
             <p><strong>É vedado ao usuário:</strong> Copiar, replicar, vender, revender, e tentar aplicar engenharia reversa sobre a resposta ou a automação do Agente; Compartilhar senhas e números já autenticados para times maiores do que o plano originalmente adquirido em flagrante burla financeira.</p>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">3. Obrigações e Responsabilidades do Cliente</h2>
             <p>Na utilização do Agente Ceruti, o usuário ("Contratante") concorda integralmente em que:</p>
             <ul className="list-disc pl-5 space-y-2">
               <li>A inteligência é parametrizada com base nas boas práticas comerciais, porém o sucesso real das negociações depende da habilidade humana e contexto externo. Assim, sendo as respostas probabilísticas elaboradas por IA (LLM), a Ceruti se exime de obrigações de garantias financeiras de resultados de faturamento para as contratantes e não se responsabiliza legal e passivamente por potenciais deals ou propostas frustradas, lucro cessante, perdas e danos comerciais.</li>
               <li>Possibilitar aos membros de sua equipe, de forma voluntária, o registro e acesso à plataforma via seus números de telefone (WhatsApp), garantindo a conformidade dos Termos de Uso (Meta Platforms, Inc - WhatsApp Business) e o não-uso desta automação para fins massivos injuriosos ou práticas de SPAM.</li>
             </ul>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">4. Planos, Cobrança e Garantia</h2>
             <p>Os serviços são gerados mediante contratos periódicos, faturas pre-pagas. Ao assinar a ferramenta, o cliente autoriza as renovações em cartões de créditos ou cobranças automáticas. Oferecemos, nos termos da Política de Reembolso e resguardada por força de contrato, a <strong>garantia de até 7 (sete) dias de reembolso incondicional</strong>, garantindo sua total tranquilidade. Expirado o prazo, fica o cliente ciente do não cabimento de cancelamento por prorrata durante o ciclo mantido, podendo solicitar unicamente a supressão de renovação vincenda.</p>

             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">5. Disponibilidade e Interrupções Naturais</h2>
             <p>Admitimos e operamos segundo os métodos de "Better Effort", garantindo a disponibilidade dos sistemas integradores na margem de 99% SLI. A contínua eficácia depende intimamente das APIs da Meta e servidores LLM e de Cloud Hosting que nós englobamos. Momentos em que ocorram instabilidades advindas destas três chaves motrizes da computação em nuvem terceirizadas serão repassados com comunicados e tolerados sem que incorram em quebra de resiliência e perdas contratuais diretas.</p>
             
             <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">6. Foro e Atualização dos Termos</h2>
             <p>Nós detemos o direito de atualizar este Contrato / Termo de Serviços quando exigido por disposições legais ou melhoria dos softwares. O novo conteúdo atualizado passará a integrar e valer àqueles que decidirem manter seus planos ativos. Para lides judiciais oriundas dos presentes Termos, fica eleito o Foro da Comarca da empresa desenvolvedora da plataforma Ceruti no Brasil e sob as leis da República Federativa do Brasil.</p>

             <p className="mt-8 pt-6 border-t border-neutral-100 text-xs text-neutral-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
