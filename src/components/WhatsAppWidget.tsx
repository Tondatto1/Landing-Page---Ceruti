import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  X, 
  Send, 
  CheckCheck, 
  Sparkles, 
  Lock, 
  Search, 
  Trash2, 
  Download, 
  CheckCircle, 
  LogOut 
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { HanaAvatar } from './HanaAvatar';
import { 
  saveLead, 
  getLeads, 
  deleteLeadWithFirestore, 
  downloadLeadsCSV, 
  fetchFirestoreLeads, 
  TrialLead 
} from '../lib/leads';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: { text: string; action: string }[];
  cta?: { text: string; link: string; icon?: string };
}

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBalloon, setShowBalloon] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New states for form trial questionnaire
  const [signupStep, setSignupStep] = useState<'idle' | 'name' | 'email' | 'phone'>('idle');
  const [prospectData, setProspectData] = useState({ name: '', email: '', phone: '' });
  const [userInputText, setUserInputText] = useState('');

  // Admin Dashboard States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadList, setLeadList] = useState<TrialLead[]>([]);
  const [passwordError, setPasswordError] = useState(false);

  // Easter egg interaction click counter for the header avatar
  const [avatarClicks, setAvatarClicks] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAvatarClick = () => {
    setAvatarClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdminModal(true);
        return 0;
      }
      return next;
    });

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setAvatarClicks(0);
    }, 2000);
  };

  // Backdoor listener: URL #admin or ?admin=true
  useEffect(() => {
    const handleUrlTrigger = () => {
      if (
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true')
      ) {
        setShowAdminModal(true);
        try {
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    handleUrlTrigger();
    window.addEventListener('hashchange', handleUrlTrigger);

    return () => {
      window.removeEventListener('hashchange', handleUrlTrigger);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Firebase auth sync states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudAdmin, setIsCloudAdmin] = useState(false);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  // Monitor Google Authentication state globally
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email === 'guilhermetondatto@gmail.com' && user.emailVerified) {
        setIsCloudAdmin(true);
        setIsAdminAuthenticated(true); // Automatically let cloud admin enter panel
      } else {
        setIsCloudAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch leads: Live cloud Firestore if cloud admin, else local storage fallback
  const loadLeadsData = async () => {
    if (isCloudAdmin) {
      setIsLoadingCloud(true);
      try {
        const cloudLeads = await fetchFirestoreLeads();
        setLeadList(cloudLeads);
      } catch (err) {
        console.error("Cloud leads fetch error, falling back to local:", err);
        setLeadList(getLeads());
      } finally {
        setIsLoadingCloud(false);
      }
    } else {
      setLeadList(getLeads());
    }
  };

  useEffect(() => {
    if (showAdminModal) {
      loadLeadsData();
    }
  }, [showAdminModal, isCloudAdmin]);


  // Show balloon with a 3-second delay when the chatbot is closed or on initial mount
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowBalloon(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowBalloon(false);
    }
  }, [isOpen]);

  // Default target number
  const WHATSAPP_NUMBER = '5567981246558';

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageText = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <strong key={index} className="font-extrabold text-neutral-950">
            {part.slice(1, -1)}
          </strong>
        );
      }
      return part;
    });
  };

  // Setup initial message sequence
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      triggerInitialSequence();
    }
  }, [isOpen]);

  const triggerInitialSequence = async () => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsTyping(false);

    const msg1: Message = {
      id: '1',
      sender: 'bot',
      text: 'Olá! Sou o assistente do Ceruti. 🚀',
      time: formatTime()
    };
    setMessages([msg1]);

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsTyping(false);

    const msg2: Message = {
      id: '2',
      sender: 'bot',
      text: 'Como posso te ajudar hoje? Selecione uma das opções abaixo para começarmos:',
      time: formatTime(),
      options: [
        { text: '1️⃣ Desejo testar por 3 dias gratuitamente', action: 'test_3_days' },
        { text: '2️⃣ Desejo falar com o suporte/atendimento', action: 'support' },
        { text: '3️⃣ Quero saber mais sobre o Agente Ceruti', action: 'more_about_ceruti' }
      ]
    };
    setMessages((prev) => [...prev, msg2]);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOptionClick = async (action: string, optionText: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: optionText,
      time: formatTime()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Filter interactive options from previous bot messages to avoid double clicks
    setMessages((prev) =>
      prev.map((m) => (m.options ? { ...m, options: undefined } : m))
    );

    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsTyping(false);

    if (action === 'test_3_days') {
      setSignupStep('name');
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Excelente escolha: o nosso agente ceruti, está pronto para capacitar e impulsionar suas vendas através do WhatsApp.\n\nPara ativarmos e liberarmos o seu *Teste Grátis de 3 Dias*, preciso de 3 informações rápidas.\n\nPor favor, digite o seu *nome completo*:',
        time: formatTime()
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'support') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Com certeza! Nosso suporte técnico está a postos para te ajudar com qualquer dúvida sobre nosso treinamento. Clique no botão abaixo para falar conosco:',
        time: formatTime(),
        cta: {
          text: 'Falar com Suporte no WhatsApp',
          link: `https://wa.me/${WHATSAPP_NUMBER}?text=Olá. Venho através da página e gostaria de tirar uma dúvida.`,
        },
        options: [
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'more_about_ceruti') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Perfeito! Selecione um dos tópicos abaixo para conhecer melhor o Agente Ceruti através das informações oficiais de cada seção:',
        time: formatTime(),
        options: [
          { text: '1️⃣ Benefícios de assinar o agente Ceruti', action: 'about_benefits' },
          { text: '2️⃣ Quem deveria assinar o agente Ceruti', action: 'about_who' },
          { text: '3️⃣ Como funciona o agente Ceruti', action: 'about_how_it_works' },
          { text: '4️⃣ Resultados de assinar o Agente Ceruti', action: 'about_results' },
          { text: '5️⃣ Principais dúvidas sobre o agente Ceruti', action: 'about_faq' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_benefits') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '📊 *Benefícios reais de assinar o agente Ceruti:*\n\n' +
              '• *Aumento significativo nas vendas*\n' +
              '• *Redução drástica no tempo de fechamento* de negociações\n' +
              '• *Aumento na recuperação de vendas* que seriam perdidas\n' +
              '• *Redução drástica do tempo* para novos vendedores darem resultado\n' +
              '• *Aumento considerável no valor médio* das vendas\n' +
              '• *Redução drástica na rotatividade* do time comercial',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_who') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '👥 *QUEM DEVE TER O CERUTI COMO TREINADOR:*\n\n' +
              'O agente foi idealizado e configurado sob medida para o aprendizado e desenvolvimento dos seguintes perfis:\n' +
              '• Vendedores\n' +
              '• Supervisores\n' +
              '• Representantes Comerciais\n' +
              '• Promotores de Vendas\n' +
              '• Gerentes Comerciais\n' +
              '• Assistentes Técnicos Comerciais (ATCs)\n\n' +
              'Capacita do operacional à gestão de forma orgânica e em minutos.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_how_it_works') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚙️ *Como funciona o processo de treinamento com o Ceruti:*\n\n' +
              'Todo o loop de aprendizado ocorre de forma extremamente simples diretamente em nosso canal oficial do WhatsApp:\n\n' +
              '1️⃣ *Envio do Problema:* O profissional de vendas da sua equipe envia a objeção ou o caso prático comercial de campo que precisa resolver.\n\n' +
              '2️⃣ *Diagnóstico:* O Agente Ceruti interage fazendo as perguntas chave ideais para mapear as particularidades do cenário.\n\n' +
              '3️⃣ *Plano de solução:* O Agente entrega um plano estratégico de argumentação rico, focado em alta conversão e quebra daquela objeção específica.\n\n' +
              '4️⃣ *Pós-Plano:* O treinador se mantém à disposição ajudando com criação de scripts de texto, refinamentos adicionais ou simulações adicionais.\n\n' +
              'Tudo isso ocorre em segundos e 100% no WhatsApp, sem tirar o vendedor do campo de batalha.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_results') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '📈 *Resultados Práticos ao treinar seu time com o Ceruti:*\n\n' +
              '• ⏱️ *Aprendizado 24/7:* Disponibilidade total com suporte instantâneo para tomadas de decisão comercial a qualquer hora do dia ou da noite.\n\n' +
              '• 🤝 *Treinamento individual personalizado:* Cada membro recebe feedback e orientações 1:1 formatados exclusivamente para o seu caso real.\n\n' +
              '• 🎯 *Padronização da operação:* Alinhamento de discursos comerciais para garantir 100% de consistência nas ações em campo.\n\n' +
              '• ⚡ *Eficiência Máxima:* Redução de até 95% do tempo costumeiramente gasto no treinamento e integração de novos contratados.\n\n' +
              '• 🛡️ *Segurança de Margem:* Corte de até 80% nos erros de argumentação comercial de preços ou de descontos.\n\n' +
              '• 🏆 *Sucesso Prático (ROI):* Time inteiramente mais veloz, preparado, confiante nas gôndolas e vendendo de forma consistente.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'about_faq') {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '❓ *Ainda tem dúvidas? Principais respostas sobre o Ceruti:*\n\n' +
              '• *Onde a equipe usa o Ceruti?* Tudo pelo WhatsApp! Integrado a um número nosso exclusivo. Sem instalação de aplicativos ou conhecimento técnico.\n\n' +
              '• *Preciso enviar manuais da empresa?* Não é necessário. O treinador foi pré-treinado com profunda inteligência focada exclusivamente no segmento do agronegócio nacional.\n\n' +
              '• *Funciona para qualquer modelo de negócio?* Sim! Suporta B2B (distribuição, indústrias) e B2C (venda ao produtor), operando nas quebras de objeções.\n\n' +
              '• *Substituirá meus vendedores?* Não, ele atua como assistente ou parceiro complementar focado em acelerar respostas e converter negócios.\n\n' +
              '• *Como se diferencia de modelos comuns?* O Ceruti carrega engenharia e metodologias validadas e proprietárias de negociação do agro, sem termos técnicos difíceis.\n\n' +
              '• *Garantia e Fidelidade:* Garantia incondicional de devolução de 14 dias para teste sem riscos. Semestral tem desconto com prazo fechado; mensal dá total flexibilidade para pausar ou cancelar sem fidelidades ou multas.',
        time: formatTime(),
        options: [
          { text: '⬅️ Voltar ao menu Ceruti', action: 'more_about_ceruti' },
          { text: '🚀 Iniciar Teste Grátis de 3 Dias', action: 'test_3_days' },
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    } else if (action === 'reset') {
      setSignupStep('idle');
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Como posso te ajudar hoje? Selecione uma das opções abaixo para começarmos:',
        time: formatTime(),
        options: [
          { text: '1️⃣ Desejo testar por 3 dias gratuitamente', action: 'test_3_days' },
          { text: '2️⃣ Desejo falar com o suporte/atendimento', action: 'support' },
          { text: '3️⃣ Quero saber mais sobre o Agente Ceruti', action: 'more_about_ceruti' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  const handleCustomInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === 'idle' || !userInputText.trim()) return;

    const userText = userInputText.trim();
    setUserInputText('');

    // Add user message to log
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: formatTime()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsTyping(false);

    if (signupStep === 'name') {
      setProspectData(prev => ({ ...prev, name: userText }));
      setSignupStep('email');
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Muito prazer, *${userText}*! 👋\n\nAgora, informe o seu *e-mail* principal:`,
        time: formatTime()
      };
      setMessages((prev) => [...prev, botMsg]);
    } 
    else if (signupStep === 'email') {
      setProspectData(prev => ({ ...prev, email: userText }));
      setSignupStep('phone');
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Excelente! E para finalizarmos, qual é o seu *WhatsApp (com DDD)* para ativarmos seu teste de 3 dias?`,
        time: formatTime()
      };
      setMessages((prev) => [...prev, botMsg]);
    } 
    else if (signupStep === 'phone') {
      // Complete Lead Signup
      setSignupStep('idle');
      saveLead(prospectData.name, prospectData.email, userText).catch((err) => {
        console.error("Firestore persistence warning (falling back to localStorage only):", err);
      });

      const messageText = `Olá, realizei meu cadastro na página e gostaria de ter acesso ao teste de três dias do agente Ceruti.`;
      const encodedMsg = encodeURIComponent(messageText);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `🎉 *Cadastro concluído com sucesso!*\n\nSensacional, *${prospectData.name}*! Seus dados foram salvos e liberados com segurança.\n\nPara iniciar agora mesmo e configurar o Agro Sales Coach no seu WhatsApp comercial, clique no botão abaixo para chamar nosso suporte de ativação de testes:`,
        time: formatTime(),
        cta: {
          text: '🚀 Liberar Teste no WhatsApp',
          link: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`
        },
        options: [
          { text: '🔄 Voltar para o menu principal', action: 'reset' }
        ]
      };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowBalloon(false); // Hide balloon when chatbot is expanded
    }
  };

  const hashSHA256 = async (str: string): Promise<string> => {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hashedInput = await hashSHA256(adminPassword);
      if (hashedInput === '1d73a48e4b7289ed82247e75afa1966a04eea918c582c1625b7709988c8f73a5') {
        setIsAdminAuthenticated(true);
        setPasswordError(false);
        setLeadList(getLeads());
      } else {
        setPasswordError(true);
      }
    } catch (err) {
      console.error('Secure hash computation error; using safe fallback verification', err);
      if (adminPassword === 'agro123') {
        setIsAdminAuthenticated(true);
        setPasswordError(false);
        setLeadList(getLeads());
      } else {
        setPasswordError(true);
      }
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out from Firebase:", err);
    }
    setIsCloudAdmin(false);
    setIsAdminAuthenticated(false);
    setAdminPassword('');
    setShowAdminModal(false);
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar este lead?')) {
      await deleteLeadWithFirestore(id);
      await loadLeadsData();
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingCloud(true);
    setPasswordError(false);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user && user.email === 'guilhermetondatto@gmail.com') {
        setIsCloudAdmin(true);
        setIsAdminAuthenticated(true);
      } else {
        alert("Acesso Negado: Apenas o e-mail de administrador (guilhermetondatto@gmail.com) tem permissão de leitura sobre o banco de dados em nuvem.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      alert("Houve um erro no login do Google. Mas você ainda pode acessar os dados locais usando a senha.");
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const filteredLeads = leadList.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 font-sans pointer-events-none">
        {/* Container for absolute overlays */}
        <div className="relative w-full h-full flex flex-col items-end pointer-events-auto">

          {/* 1. Pulse Promo Balloon */}
          <AnimatePresence>
            {showBalloon && !isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-18 sm:bottom-22 right-0 mr-1 flex flex-col items-end w-[220px] sm:w-[250px] drop-shadow-[0_8px_25px_rgba(0,0,0,0.3)] select-none z-50 cursor-pointer"
                onClick={toggleWidget}
              >
                {/* Balloon Bubble Body */}
                <div className="relative w-full group bg-gradient-to-br from-white via-[#f4fdf9] to-[#edfcf5] border border-emerald-200/90 text-neutral-900 rounded-xl py-3 px-4 pr-10 text-xs sm:text-sm font-medium tracking-tight shadow-[0_6px_22px_rgba(0,168,62,0.14)] transition-all duration-300 hover:border-[#00a83e]/50">
                  <div className="flex items-center gap-1.5 text-[14px] sm:text-[15px] font-black text-neutral-950 leading-tight select-none">
                    <Sparkles className="w-4 h-4 text-[#00a83e] animate-pulse shrink-0" />
                    <span>Teste por 3 dias</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[11px] sm:text-[12px] font-extrabold text-[#00a83e] mt-1 select-none transition-colors duration-200 group-hover:text-emerald-700">
                    <span className="opacity-95 group-hover:opacity-100">Garanta seu acesso</span>
                    <span className="text-[10px]">⚡</span>
                  </div>

                  {/* Dismiss X button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBalloon(false);
                    }}
                    className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-800 hover:bg-emerald-100/50 transition-colors p-1 rounded-full"
                    aria-label="Fechar balão"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Chat Bubble Arrow Pin */}
                <div className="w-3.5 h-3.5 bg-[#edfcf5] rotate-45 -mt-2 mr-5 border-r border-b border-emerald-200/90" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Expanded Chatbot Window */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute bottom-20 sm:bottom-24 right-0 w-[350px] sm:w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[80vh] z-[999] pointer-events-auto"
              >
                {/* Solid Glowing Border SVG overlay with perpetual simultaneous animation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
                  <defs>
                    <linearGradient id="metallic-blue-green" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#005a9c" />
                      <stop offset="40%" stopColor="#09297a" />
                      <stop offset="80%" stopColor="#026b48" />
                      <stop offset="100%" stopColor="#004026" />
                    </linearGradient>
                    <filter id="glow-border" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <motion.rect
                    x="2.5"
                    y="2.5"
                    width="calc(100% - 5px)"
                    height="calc(100% - 5px)"
                    rx="24"
                    fill="none"
                    stroke="url(#metallic-blue-green)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    style={{ filter: "url(#glow-border)" }}
                    animate={{
                      opacity: [0.75, 1, 0.75]
                    }}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                  />
                </svg>

                {/* Main container with slightly increased border thickness */}
                <div className="w-full h-full flex flex-col bg-[#efeae2] rounded-3xl border border-neutral-200 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative">
                  {/* Custom Header (WhatsApp teal styled) */}
                  <div className="bg-[#008069] text-white py-3.5 px-4 flex items-center justify-between shadow-sm relative shrink-0">
                    <div className="flex items-center gap-3">
                      {/* Hidden administration panel portal triggers on 5 rapid clicks on the 'C' brand avatar */}
                      <div 
                        onClick={handleAvatarClick}
                        className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-white/20 shadow-inner cursor-pointer select-none bg-neutral-100"
                        title="Hana - assistente virtual"
                      >
                        <HanaAvatar className="w-full h-full" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#008069] animate-pulse" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-xs sm:text-sm tracking-tight leading-tight text-white force-white">Hana - assistente virtual</h4>
                        <p className="text-[11px] text-[#b3dfd6] force-white flex items-center gap-1 font-medium font-sans select-none">
                          <span className="force-white">Online</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                        aria-label="Minimizar conversa"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages Log Area */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    style={{
                      backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                      backgroundBlendMode: 'overlay',
                      backgroundColor: '#efeae2',
                      opacity: 0.97
                    }}
                  >
                    <div className="flex justify-center mb-2">
                      <div className="bg-amber-100/90 border border-amber-200 text-amber-900 text-[11px] px-3 py-1 rounded-lg text-center font-medium max-w-[85%] shadow-sm uppercase tracking-wider">
                        🔒 Canal Oficial • Resposta imediata
                      </div>
                    </div>

                    {/* Messages Mapping */}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[82%] ${
                          msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`relative px-3.5 py-2.5 rounded-2xl shadow-sm text-sm ${
                            msg.sender === 'user'
                              ? 'bg-[#d9fdd3] text-neutral-800 rounded-tr-none'
                              : 'bg-white text-neutral-800 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed break-words font-medium text-[13.5px] font-sans">
                            {renderMessageText(msg.text)}
                          </p>

                          {msg.cta && (
                            <div className="mt-3.5">
                              <a
                                href={msg.cta.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#25D366] text-white font-extrabold uppercase text-[11px] tracking-wider rounded-xl hover:bg-[#20ba5c] hover:scale-[1.02] shadow-[0_4px_12px_rgba(37,211,102,0.3)] transition-all duration-300"
                              >
                                <MessageCircle className="w-4 h-4 fill-white" />
                                {msg.cta.text}
                              </a>
                            </div>
                          )}

                          <span className="block text-[10px] text-neutral-400 text-right mt-1.5 select-none font-sans font-normal leading-none">
                            {msg.time}
                            {msg.sender === 'user' && (
                              <CheckCheck className="inline-block w-3.5 h-3.5 ml-1 text-sky-500" />
                            )}
                          </span>
                        </div>

                        {/* Options below */}
                        {msg.options && (
                          <div className="mt-2.5 w-full flex flex-col gap-2">
                            {msg.options.map((opt, i) => {
                              const isTestOption = opt.action === 'test_3_days';
                              return (
                                <button
                                  key={i}
                                  onClick={() => handleOptionClick(opt.action, opt.text)}
                                  className={`text-left w-full transition-all duration-300 active:scale-98 rounded-xl ${
                                    isTestOption
                                      ? "bg-gradient-to-r from-[#004d1a] to-[#00a83e] hover:from-[#006020] hover:to-[#00b944] text-white font-black text-xs sm:text-[13px] py-3.5 px-4 border-b-2 border-[#003813] shadow-[0_4px_15px_rgba(0,168,62,0.3)] animate-pulse cursor-pointer"
                                      : "bg-white hover:bg-teal-50 hover:text-[#008069] text-gray-700 font-semibold text-xs sm:text-[13px] py-2.5 px-3.5 border border-neutral-200 shadow-sm cursor-pointer"
                                  }`}
                                >
                                  {opt.text}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Simulated Typing */}
                    {isTyping && (
                      <div className="flex items-center gap-1.5 max-w-[40%] bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm mr-auto">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Form / Dummy Input Footer */}
                  <form
                    onSubmit={handleCustomInputSubmit}
                    className="bg-[#f0f2f5] px-3.5 py-3 flex items-center gap-2.5 border-t border-neutral-200 shrink-0"
                  >
                    {signupStep !== 'idle' ? (
                      <input
                        type={signupStep === 'email' ? 'email' : 'text'}
                        value={userInputText}
                        onChange={(e) => setUserInputText(e.target.value)}
                        placeholder={
                          signupStep === 'name' 
                            ? 'Digite seu nome completo...' 
                            : signupStep === 'email' 
                              ? 'Digite seu melhor e-mail...' 
                              : 'Digite seu WhatsApp com DDD...'
                        }
                        required
                        className="flex-1 bg-white rounded-full py-2 px-4 text-neutral-800 font-sans text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#008069] shadow-inner"
                        autoFocus
                      />
                    ) : (
                      <input
                        type="text"
                        disabled
                        value=""
                        placeholder="Escolha uma opção acima..."
                        className="flex-1 bg-white rounded-full py-2 px-4 text-neutral-400 font-sans text-xs sm:text-sm select-none cursor-not-allowed border-none outline-none"
                      />
                    )}
                    <button
                      type="submit"
                      disabled={signupStep === 'idle'}
                      className={`flex items-center justify-center h-10 w-10 rounded-full shadow-sm transition-all ${
                        signupStep !== 'idle'
                          ? 'bg-[#008069] text-white hover:bg-[#006e57] active:scale-95 cursor-pointer'
                          : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Main Floating WhatsApp Button Selector */}
          <button
            onClick={toggleWidget}
            id="whatsapp_floating_button"
            aria-label="Fale conosco no WhatsApp"
            className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] transition-all duration-300 group border-2 border-white/90 cursor-pointer ${
              isOpen ? 'bg-neutral-800 hover:bg-neutral-900 shadow-neutral-700/30 rotate-90' : 'bg-[#25D366] hover:bg-[#20ba5c] hover:scale-110'
            }`}
          >
            {!isOpen && (
              <>
                <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none -z-10 group-hover:scale-115 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping pointer-events-none -z-10" />
              </>
            )}

            {isOpen ? (
              <X className="w-7 h-7 stroke-[2.5]" />
            ) : (
              <svg 
                className="w-8 h-8 sm:w-9 sm:h-9 fill-current stroke-none drop-shadow-sm select-none" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.022-.015-.029-.02-.054-.051l-.105-.125c-.27-.324-1.79-1.082-1.79-1.082s-.225-.138-.415.111l-.475.63s-.167.228-.432.115c-.266-.113-.99-.44-1.85-1.205-.666-.595-1.116-1.332-1.246-1.56-.13-.227-.014-.35.101-.462l.307-.36s.1-.15.004-.298c-.097-.15-1.015-2.45-1.015-2.45s-.125-.335-.41-.318c-.287.017-.822.422-1.137.77-.314.347-.565.807-.533 1.393.07 1.314.614 2.502 1.488 3.518.874 1.015 1.956 1.83 3.12 2.38 1.127.531 2.155.805 2.873.744.757-.064 1.348-.38 1.66-.75.312-.371.492-.852.492-.852s.06-.182-.016-.27-.268-.14-.268-.14zm-5.466 7.424h-.01c-1.875 0-3.71-.493-5.32-1.425l-.382-.22-3.955 1.038 1.056-3.855-.24-.383A9.761 9.761 0 011.82 12c0-5.411 4.417-9.82 9.851-9.82a9.774 9.774 0 016.968 2.878c1.859 1.861 2.883 4.34 2.88 6.945C21.516 17.411 17.1 21.82 11.666 21.82zM12 0C5.373 0 0 5.372 0 12c0 2.11.547 4.16 1.59 5.973L0 24l6.216-1.63C7.94 23.36 9.94 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
            )}

            {!isOpen && (
              <span className="absolute right-18 sm:right-20 scale-0 bg-neutral-950 text-white font-sans text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 group-hover:scale-100 whitespace-nowrap shadow-black/20">
                Teste de 3 Dias Grátis ⚡
              </span>
            )}
          </button>

        </div>
      </div>

      {/* 4. Beautiful, Immersive Admin Dashboard Portal Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[24px] border border-neutral-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 sm:p-8 overflow-hidden font-sans"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6 shrink-0">
                <div className="flex items-center gap-2.5 text-[#008069]">
                  <Lock className="w-5 h-5" />
                  <h3 className="font-sans font-black text-lg sm:text-xl tracking-tight text-neutral-900 uppercase">
                    Painel de Leads • Agro Sales Coach
                  </h3>
                </div>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {!isAdminAuthenticated ? (
                /* AUTHENTICATION FORM SCREEN WITH GOOGLE AND LOCAL PASS BACKUPS */
                <div className="my-auto py-4 text-center max-w-sm mx-auto space-y-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#008069] shadow-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0b1a30] text-base mb-1">Acesso Restrito ao Proprietário</h4>
                    <p className="text-xs font-semibold text-neutral-500 leading-normal">
                      Selecione uma das opções abaixo para acessar o painel de gerenciamento de leads.
                    </p>
                  </div>

                  {/* Google Authenticator - Live Database */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={isLoadingCloud}
                      onClick={handleGoogleLogin}
                      className="font-extrabold flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-white border border-neutral-200 text-neutral-700 text-xs tracking-wider uppercase rounded-xl shadow-sm hover:bg-neutral-50 hover:border-neutral-300 active:scale-98 transition-all disabled:opacity-55 cursor-pointer"
                    >
                      {isLoadingCloud ? (
                        <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      {isLoadingCloud ? 'Conectando...' : 'Entrar com Google Administrador'}
                    </button>
                    <p className="text-[10px] font-extrabold text-[#008069] uppercase tracking-wider">
                      ★ Libera Sincronização em Nuvem (Firestore)
                    </p>
                  </div>

                  {/* Split Divider */}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">
                    <span className="h-px bg-neutral-200 flex-1" />
                    <span>ou acesse via senha local</span>
                    <span className="h-px bg-neutral-200 flex-1" />
                  </div>

                  {/* Local Sandbox Password */}
                  <form onSubmit={handleAdminVerify} className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <input
                        type="password"
                        placeholder="Senha de Acesso Local"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setPasswordError(false);
                        }}
                        required
                        className={`w-full px-4 py-3 bg-neutral-50 border rounded-xl text-center text-xs font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all ${
                          passwordError 
                            ? 'border-red-500 focus:ring-red-500/10' 
                            : 'border-neutral-300 focus:ring-[#008069]/10 focus:border-[#008069]'
                        }`}
                      />
                      {passwordError && (
                        <p className="text-red-600 font-extrabold text-[10px] uppercase tracking-wide">
                          ⚠️ Senha incorreta. Tente novamente!
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-neutral-800 hover:bg-neutral-900 text-white font-extrabold text-[11px] tracking-widest uppercase rounded-xl transition-all shadow-sm"
                    >
                      Acessar Localmente (agro123)
                    </button>
                  </form>
                </div>
              ) : (
                /* LEADS TABLE SCREEN */
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Dashboard stats / Control actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 shrink-0">
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008069] uppercase tracking-wider mb-0.5">
                          {isCloudAdmin ? '☁️ Nuvem Ativa (Firestore)' : '💾 Armazenamento Local'}
                        </span>
                        <h5 className="text-2xl font-black text-neutral-900">{leadList.length} leads</h5>
                      </div>
                      <div className="bg-[#008069]/10 text-[#008069] p-2.5 rounded-xl">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 font-sans">
                      <button
                        onClick={() => downloadLeadsCSV(leadList)}
                        className="inline-flex items-center justify-center gap-2 bg-[#008069] hover:bg-[#006e57] text-white px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-emerald-950/10 cursor-pointer w-full sm:w-auto text-center"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Planilha (Excel/CSV)
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4 shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome, e-mail ou WhatsApp..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008069] focus:bg-white text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Leads Data Container */}
                  <div className="flex-1 overflow-y-auto border border-neutral-100 rounded-2xl bg-neutral-50/50">
                    {filteredLeads.length === 0 ? (
                      <div className="py-12 text-center text-neutral-400 font-sans">
                        <p className="text-sm font-medium">Nenhum registro de cadastro encontrado.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {filteredLeads.map((lead) => (
                          <div 
                            key={lead.id} 
                            className="p-4 hover:bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-colors"
                          >
                            <div className="space-y-1">
                              <h6 className="font-extrabold text-sm text-neutral-900 leading-tight">{lead.name}</h6>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs font-semibold text-neutral-500">
                                <span className="text-[#008069] truncate max-w-[200px]">{lead.email}</span>
                                <span className="hidden sm:inline w-1 h-1 bg-neutral-300 rounded-full" />
                                <span>{lead.phone}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100/50">
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {new Date(lead.createdAt).toLocaleString('pt-BR', {
                                  day: '2-digit', month: '2-digit', year: '2-digit',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                title="Excluir lead"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Admin Footer Actions */}
                  <div className="mt-5 pt-4 border-t border-neutral-100 flex justify-between items-center shrink-0">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
                      Senha padrão: agro123
                    </p>
                    <button
                      onClick={handleAdminLogout}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair do Painel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
