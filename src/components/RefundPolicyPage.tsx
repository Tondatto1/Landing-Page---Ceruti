import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RefundPolicyPage() {
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
          <h1 className="text-3xl font-black text-[#0c1f22] mb-8">Política de Reembolso e Cancelamento</h1>
          
          <div className="space-y-6 text-neutral-600 font-medium text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">1. Garantia Incondicional estendida de 7 Dias</h2>
            <p>
              Em respeito aos nossos clientes e como prova de confiança na tecnologia da Ceruti, nós estendemos o prazo garantido pelo Art. 49 do Código de Defesa do Consumidor (CDC) para uma <strong>garantia incondicional de 7 dias corridos</strong>. Durante este período (contado a partir da efetivação do pagamento da primeira mensalidade ou ciclo), você poderá testar nossa Inteligência de Vendas.
            </p>
            <p>
              Se, por qualquer motivo, você entender que a ferramenta não atende às necessidades da sua equipe comercial e não obteve o retorno esperado, garantimos a devolução de <strong>100% do valor pago</strong>. Não aplicamos multas ou retenção de taxas no processo exercido dentro desse prazo de garantia incondicional.
            </p>

            <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">2. Procedimento para Solicitação</h2>
            <p>
              As solicitações de reembolso para as situações cobertas devem ser enviadas formalmente ao nosso suporte oficial via WhatsApp. Deverá ser informado o e-mail de compra e/ou o CPF/CNPJ pagador. A solicitação deve registrar-se antes das 23h59 (horário de Brasília) do 7º dia contratual.
            </p>

            <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">3. Regras de Cancelamento Posterior à Garantia</h2>
            <p>
              Uma vez transcorrido o prazo de garantia incondicional de 7 dias, o serviço caracterizará a prestação contínua de tecnologia e uso sistêmico de IA hospedada. Após esse prazo:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Não serão processados reembolsos ou devoluções proporcionais (pro rata) por não utilização temporária ou arrependimento tardio.</li>
              <li>A assinatura é classificada como serviço pré-pago baseada na recorrência (mensal ou semestral).</li>
              <li>O cliente pode requisitar o <strong>cancelamento da renovação</strong> a qualquer tempo. O cancelamento interromperá futuras cobranças de recorrência, mas sua equipe manterá o acesso à ferramenta até o encerramento do último ciclo pago vigente.</li>
            </ul>

            <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">4. Prazos Bancários de Estorno</h2>
            <p>
              Após a aprovação interna da nossa equipe, o reembolso é disparado para o gateway de pagamento responsável num prazo de até 2 (dois) dias úteis. As operadoras de cartão de crédito e as instituições bancárias possuem prazos próprios:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cartão de Crédito:</strong> O valor estornado será retornado na fatura em aberto (a atual ou a próxima), podendo demorar de 30 a 60 dias para o emissor do cartão refletir o saldo.</li>
              <li><strong>PIX ou Boleto:</strong> Em transferências e depósitos garantidos por via direta de caixa, os depósitos serão repassados via PIX ou TED à conta com o CPF/CNPJ originário do comprador num prazo de até 7 dias úteis.</li>
            </ul>

            <h2 className="text-lg font-bold text-[#0c1f22] mt-6 mb-3">5. Disputas e Chargebacks Injustificados</h2>
            <p>
              Ressaltamos que a abertura de disputas junto às operadoras de cartão sem uma solicitação prévia formalizada e recusada indevidamente através de nosso suporte, quando já fora do período de 7 dias de garantia ou após o efetivo uso extensivo dos servidores, configura descumprimento de Termos, ocasionando no bloqueio imediato do acesso até a resolução da lide amigavelmente.
            </p>

            <p className="mt-8 pt-6 border-t border-neutral-100 text-xs text-neutral-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
