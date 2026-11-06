import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  EVENTO_PHONE_CLICK,
  EVENTO_WHATSAPP_CLICK,
  registrarCliqueTelefone,
  registrarCliqueWhatsApp,
  resetarDebounceTrackingParaTestes,
  sanitizarCaminhoPagina,
  sanitizarUrlContato,
  sanitizarUrlPagina,
} from "../lib/tracking.ts";

describe("Etapa 1 — Saneamento de Privacidade no Tracking e dataLayer", () => {
  beforeEach(() => {
    resetarDebounceTrackingParaTestes();
    // Simula objeto global window com dataLayer limpo
    (globalThis as unknown as { window: { dataLayer: unknown[] } }).window = {
      dataLayer: [],
    };
  });

  it("remove o parâmetro ?text= com dados pessoais do FormularioOrcamento em links wa.me", () => {
    const mensagemComPII = [
      "Olá! Gostaria de solicitar um orçamento com a ME Guinchos:",
      "• Nome: Teste Privacidade",
      "• Telefone de contato: (11) 99999-0000",
      "• Serviço/Veículo: Carro de passeio ou SUV",
      "• Local de partida: Rua Martinho de Campos, 538",
      "• Destino da remoção: Av. Paulista, 1000",
      "• Condição do veículo: Placa ABC-1234 câmbio travado",
    ].join("\n");

    const linkComPII = `https://wa.me/5511998369565?text=${encodeURIComponent(mensagemComPII)}`;
    const linkSanitizado = sanitizarUrlContato(linkComPII);

    assert.equal(linkSanitizado, "https://wa.me/5511998369565");
    assert.equal(linkSanitizado.includes("Teste"), false);
    assert.equal(linkSanitizado.includes("99999"), false);
    assert.equal(linkSanitizado.includes("Martinho"), false);
    assert.equal(linkSanitizado.includes("ABC-1234"), false);
  });

  it("preserva o parâmetro phone numérico em api.whatsapp.com mas remove text e outros parâmetros", () => {
    const raw =
      "https://api.whatsapp.com/send?phone=5511998369565&text=Meu%20nome%20eh%20Joao%2011988887777&source=form";
    const limpo = sanitizarUrlContato(raw);

    assert.equal(limpo, "https://api.whatsapp.com/send?phone=5511998369565");
    assert.equal(limpo.includes("Joao"), false);
    assert.equal(limpo.includes("11988887777"), false);
  });

  it("sanitiza links tel: removendo parâmetros ou fragmentos", () => {
    assert.equal(
      sanitizarUrlContato("tel:+5511998369565?nome=Maria#hash"),
      "tel:+5511998369565",
    );
  });

  it("preserva parâmetros gclid, wbraid, gbraid e utm_* legítimos na URL da página e descarta PII", () => {
    const urlComUtmEPii =
      "https://memorettiguinchos.com.br/solicitar-orcamento?gclid=EAIaIQobChMI_TEST123&utm_source=google&utm_medium=cpc&utm_campaign=guincho_sp&nome=Carlos+Silva&telefone=11999990000&utm_term=contato@empresa.com.br#form";

    const urlSanitizada = sanitizarUrlPagina(urlComUtmEPii);
    assert.equal(
      urlSanitizada,
      "https://memorettiguinchos.com.br/solicitar-orcamento?gclid=EAIaIQobChMI_TEST123&utm_source=google&utm_medium=cpc&utm_campaign=guincho_sp",
    );
    assert.equal(urlSanitizada.includes("Carlos"), false);
    assert.equal(urlSanitizada.includes("11999990000"), false);
    assert.equal(urlSanitizada.includes("contato@empresa.com.br"), false);
  });

  it("garante zero vazamento de PII no window.dataLayer ao disparar registrarCliqueWhatsApp e registrarCliqueTelefone", () => {
    const linkComPII =
      "https://wa.me/5511998369565?text=" +
      encodeURIComponent(
        "Nome: Teste Privacidade\nTelefone: 11999990000\nOrigem: Rua X, 123\nDestino: Oficina Y",
      );

    registrarCliqueWhatsApp({
      page_path: "/solicitar-orcamento?nome=Teste+Privacidade",
      page_location:
        "https://memorettiguinchos.com.br/solicitar-orcamento?gclid=GCLID_VALIDO_1&telefone=11999990000",
      button_location: "form_orcamento_submit",
      link_url: linkComPII,
    });

    registrarCliqueTelefone({
      page_path: "/solicitar-orcamento",
      page_location: "https://memorettiguinchos.com.br/solicitar-orcamento?gclid=GCLID_VALIDO_1",
      button_location: "form_orcamento_phone_direct",
      link_url: "tel:+5511998369565?usuario=Teste",
    });

    const dataLayer = (globalThis as unknown as { window: { dataLayer: Record<string, string>[] } })
      .window.dataLayer;

    assert.equal(dataLayer.length, 2);

    const serializado = JSON.stringify(dataLayer);
    assert.equal(serializado.includes("Teste Privacidade"), false);
    assert.equal(serializado.includes("11999990000"), false);
    assert.equal(serializado.includes("Rua X"), false);
    assert.equal(serializado.includes("Oficina Y"), false);

    assert.deepEqual(dataLayer[0], {
      event: EVENTO_WHATSAPP_CLICK,
      page_path: "/solicitar-orcamento",
      page_location:
        "https://memorettiguinchos.com.br/solicitar-orcamento?gclid=GCLID_VALIDO_1",
      button_location: "form_orcamento_submit",
      link_url: "https://wa.me/5511998369565",
    });

    assert.deepEqual(dataLayer[1], {
      event: EVENTO_PHONE_CLICK,
      page_path: "/solicitar-orcamento",
      page_location:
        "https://memorettiguinchos.com.br/solicitar-orcamento?gclid=GCLID_VALIDO_1",
      button_location: "form_orcamento_phone_direct",
      link_url: "tel:+5511998369565",
    });
  });

  it("sanitiza corretamente o caminho da página (page_path)", () => {
    assert.equal(sanitizarCaminhoPagina("/solicitar-orcamento?foo=bar#baz"), "/solicitar-orcamento");
    assert.equal(sanitizarCaminhoPagina("guincho-osasco"), "/guincho-osasco");
    assert.equal(sanitizarCaminhoPagina(""), "/");
  });

  it("preserva UTMs legítimas complexas do Google Ads (ValueTrack, datas, cauda longa) em sanitizarUrlPagina", () => {
    const urlValueTrack =
      "https://memorettiguinchos.com.br/guincho-24-horas?gclid=EAIaIQobChMI_VT_01&utm_source=google&utm_medium=cpc&utm_campaign=cid-21849085989_2026-11-06_24/7&utm_term=kwd-293847561029:loc-1001773&utm_content=guincho+24+horas+zona+oeste+sp+marginal+tiete";

    const sanitizada = sanitizarUrlPagina(urlValueTrack);
    assert.equal(sanitizada.includes("utm_campaign=cid-21849085989_2026-11-06_24%2F7"), true);
    assert.equal(sanitizada.includes("utm_term=kwd-293847561029%3Aloc-1001773"), true);
    assert.equal(
      sanitizada.includes("utm_content=guincho+24+horas+zona+oeste+sp+marginal+tiete"),
      true,
    );
  });
});
