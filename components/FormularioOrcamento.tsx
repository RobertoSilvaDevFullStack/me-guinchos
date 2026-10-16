"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Pictograma } from "@/components/Pictograma";
import { siteContactLinks, sitePhone } from "@/lib/contact";
import { registrarCliqueWhatsApp } from "@/lib/tracking";

export function FormularioOrcamento() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servico, setServico] = useState("Carro de passeio ou SUV");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const linhasMensagem = [
      "Olá! Gostaria de solicitar um orçamento com a ME Guinchos:",
      nome ? `• Nome: ${nome}` : "",
      telefone ? `• Telefone de contato: ${telefone}` : "",
      `• Serviço/Veículo: ${servico}`,
      origem ? `• Local de partida: ${origem}` : "",
      destino ? `• Destino da remoção: ${destino}` : "",
      observacoes ? `• Condição do veículo: ${observacoes}` : "",
    ].filter(Boolean);

    const mensagemFormatada = linhasMensagem.join("\n");
    const linkDestino = `https://wa.me/${sitePhone.e164.slice(1)}?text=${encodeURIComponent(mensagemFormatada)}`;

    // Registra a conversão no dataLayer
    registrarCliqueWhatsApp({
      page_path: typeof window !== "undefined" ? window.location.pathname : "/solicitar-orcamento",
      page_location: typeof window !== "undefined" ? window.location.href : "",
      button_location: "form_orcamento_submit",
      link_url: linkDestino,
    });

    setEnviado(true);

    // Abre o WhatsApp com a mensagem estruturada
    if (typeof window !== "undefined") {
      window.open(linkDestino, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="placa placa--branca p-6 sm:p-8 rounded-xl max-w-2xl mx-auto shadow-md" data-placa="branca">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--azul-noite)] mb-2">
          Preencha os dados do atendimento
        </h2>
        <p className="text-sm text-[var(--grafite-medio)]">
          As informações abaixo nos ajudam a calcular a distância, o caminhão adequado e o valor exato
          sem perda de tempo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campo-nome" className="block text-xs font-bold uppercase tracking-wider text-[var(--azul-noite)] mb-1">
              Seu nome
            </label>
            <input
              id="campo-nome"
              type="text"
              required
              placeholder="Ex.: Carlos Souza"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--linha)] bg-white text-[var(--azul-noite)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azul)]"
            />
          </div>

          <div>
            <label htmlFor="campo-telefone" className="block text-xs font-bold uppercase tracking-wider text-[var(--azul-noite)] mb-1">
              Telefone / WhatsApp
            </label>
            <input
              id="campo-telefone"
              type="tel"
              required
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--linha)] bg-white text-[var(--azul-noite)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azul)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="campo-servico" className="block text-xs font-bold uppercase tracking-wider text-[var(--azul-noite)] mb-1">
            Tipo de serviço ou veículo
          </label>
          <select
            id="campo-servico"
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--linha)] bg-white text-[var(--azul-noite)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azul)] font-medium"
          >
            <option value="Carro de passeio ou SUV">Guincho para Carro de Passeio ou SUV</option>
            <option value="Van ou utilitário leve">Guincho para Van ou Utilitário Leve</option>
            <option value="Transporte de empilhadeira">Transporte ou Remoção de Empilhadeira</option>
            <option value="Socorro e reboque imediato (pane/colisão)">Socorro Imediato por Pane ou Colisão</option>
            <option value="Movimentação de carga">Movimentação de Cargas com Empilhadeira</option>
            <option value="Outro maquinário ou embarcação">Outro Veículo, Máquina ou Embarcação</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="campo-origem" className="block text-xs font-bold uppercase tracking-wider text-[var(--azul-noite)] mb-1">
              Local de partida (origem)
            </label>
            <input
              id="campo-origem"
              type="text"
              required
              placeholder="Rua, bairro ou ponto na Zona Oeste"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--linha)] bg-white text-[var(--azul-noite)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azul)]"
            />
          </div>

          <div>
            <label htmlFor="campo-destino" className="block text-xs font-bold uppercase tracking-wider text-[var(--azul-noite)] mb-1">
              Local de entrega (destino)
            </label>
            <input
              id="campo-destino"
              type="text"
              required
              placeholder="Oficina, pátio ou bairro de entrega"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--linha)] bg-white text-[var(--azul-noite)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azul)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="campo-observacoes" className="block text-xs font-bold uppercase tracking-wider text-[var(--azul-noite)] mb-1">
            Condições do veículo / observações (opcional)
          </label>
          <textarea
            id="campo-observacoes"
            rows={2}
            placeholder="Ex.: câmbio automático travado, roda avariada, chave no local, subsolo..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--linha)] bg-white text-[var(--azul-noite)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--azul)]"
          />
        </div>

        <button
          type="submit"
          className="acao acao--whatsapp w-full justify-center text-base py-3 font-bold mt-2 cursor-pointer"
          data-tracking-location="form_orcamento_submit_btn"
        >
          <Pictograma nome="whatsapp" tamanho={22} />
          <span>Enviar Orçamento pelo WhatsApp</span>
          <Pictograma nome="seta" tamanho={14} className="acao__seta" />
        </button>

        {enviado && (
          <p className="text-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-md mt-2">
            ✓ Mensagem gerada! Caso o aplicativo do WhatsApp não tenha aberto automaticamente, verifique se seu navegador bloqueou a janela pop-up.
          </p>
        )}
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--linha)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-xs font-bold text-[var(--azul-noite)]">Prefere ligar ou mandar mensagem direta?</p>
          <p className="text-xs text-[var(--grafite-medio)]">Atendimento 24 horas, todos os dias da semana.</p>
        </div>
        <div className="flex gap-2">
          <a
            href={siteContactLinks.phoneHref}
            className="acao acao--ligar text-xs py-2 px-3 font-bold"
            data-tracking-location="form_orcamento_phone_direct"
          >
            <Pictograma nome="telefone" tamanho={16} />
            <span>Ligar agora</span>
          </a>
          <a
            href={siteContactLinks.whatsappHref}
            className="acao acao--whatsapp text-xs py-2 px-3 font-bold"
            data-tracking-location="form_orcamento_wa_direct"
          >
            <Pictograma nome="whatsapp" tamanho={16} />
            <span>Chamar direto</span>
          </a>
        </div>
      </div>
    </div>
  );
}
