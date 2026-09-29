"use client";

import { useEffect } from "react";

/**
 * Interação assinatura do sistema: a placa não faz nada até a luz bater nela.
 * Quando entra no viewport, a tarja acende e um brilho diagonal varre o campo
 * uma vez, escalonado por ordem de aparição. Um único momento autoral,
 * aplicado só ao componente placa — não uma entrada genérica por seção.
 *
 * Desligado por completo em prefers-reduced-motion: as placas já nascem acesas.
 */
export function Retrorreflexao() {
  useEffect(() => {
    const placas = Array.from(
      document.querySelectorAll<HTMLElement>("[data-placa]"),
    );
    if (placas.length === 0) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    const raiz = document.documentElement;

    const acenderTudo = () => {
      raiz.classList.remove("com-luz");
      placas.forEach((placa) => placa.classList.add("esta-acesa"));
    };

    if (semMovimento.matches || !("IntersectionObserver" in window)) {
      acenderTudo();
      return;
    }

    // Só agora o CSS pode apagar as placas. Sem esta classe — JS desligado,
    // erro de hidratação, movimento reduzido — tudo nasce aceso e visível.
    raiz.classList.add("com-luz");

    let naFila = 0;
    let ultimoDisparo = 0;

    const observador = new IntersectionObserver(
      (entradas) => {
        const agora = performance.now();
        // Reinicia a escada quando houve uma pausa: cada bloco de placas que
        // chega junto acende em cascata, não a página inteira de uma vez.
        if (agora - ultimoDisparo > 600) naFila = 0;

        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const alvo = entrada.target as HTMLElement;
          const atraso = Math.min(naFila, 5) * 90;
          naFila += 1;
          ultimoDisparo = agora;
          window.setTimeout(() => alvo.classList.add("esta-acesa"), atraso);
          observador.unobserve(alvo);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 },
    );

    placas.forEach((placa) => observador.observe(placa));

    const aoTrocarPreferencia = (evento: MediaQueryListEvent) => {
      if (evento.matches) {
        observador.disconnect();
        acenderTudo();
      }
    };
    semMovimento.addEventListener("change", aoTrocarPreferencia);

    return () => {
      observador.disconnect();
      semMovimento.removeEventListener("change", aoTrocarPreferencia);
      raiz.classList.remove("com-luz");
    };
  }, []);

  return null;
}
