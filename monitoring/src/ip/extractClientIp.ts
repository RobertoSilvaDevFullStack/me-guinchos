import { isIP } from "node:net";
import type { IpExtractionOptions, IpExtractionResult } from "../types.ts";

/**
 * Converte um endereço IPv4 em inteiro sem sinal de 32 bits (BigInt).
 */
function ipv4ToBigInt(ip: string): bigint | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let result = BigInt(0);
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const num = Number(part);
    if (num < 0 || num > 255) return null;
    result = (result << BigInt(8)) | BigInt(num);
  }
  return result;
}

/**
 * Converte um endereço IPv6 em inteiro de 128 bits (BigInt).
 */
function ipv6ToBigInt(ip: string): bigint | null {
  const cleanIp = ip.split("%")[0] ?? ip; // Remove zone index se existir
  const doubleColonParts = cleanIp.split("::");
  if (doubleColonParts.length > 2) return null;

  const left = doubleColonParts[0] ? doubleColonParts[0].split(":") : [];
  const right =
    doubleColonParts.length === 2 && doubleColonParts[1]
      ? doubleColonParts[1].split(":")
      : [];

  // Suporte a IPv4 embutido no final do IPv6
  if (right.length > 0 && right[right.length - 1]?.includes(".")) {
    const v4 = ipv4ToBigInt(right.pop()!);
    if (v4 === null) return null;
    right.push(((v4 >> BigInt(16)) & BigInt(0xffff)).toString(16));
    right.push((v4 & BigInt(0xffff)).toString(16));
  } else if (
    doubleColonParts.length === 1 &&
    left.length > 0 &&
    left[left.length - 1]?.includes(".")
  ) {
    const v4 = ipv4ToBigInt(left.pop()!);
    if (v4 === null) return null;
    left.push(((v4 >> BigInt(16)) & BigInt(0xffff)).toString(16));
    left.push((v4 & BigInt(0xffff)).toString(16));
  }

  let groups: string[];
  if (doubleColonParts.length === 2) {
    const missing = 8 - (left.length + right.length);
    if (missing < 1) return null;
    groups = [...left, ...Array(missing).fill("0"), ...right];
  } else {
    if (left.length !== 8) return null;
    groups = left;
  }

  let result = BigInt(0);
  for (const group of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null;
    result = (result << BigInt(16)) | BigInt(parseInt(group, 16));
  }
  return result;
}

/**
 * Normaliza um endereço IP:
 * - Remove colchetes e porta quando presentes em IPv4/IPv6
 * - Converte IPv4 mapeado em IPv6 (`::ffff:192.0.2.1`) para IPv4 puro (`192.0.2.1`)
 * - Retorna `null` se não for um IP válido
 */
export function normalizeIp(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let candidate = raw.trim();
  if (!candidate) return null;

  // Remove zona IPv6 (%eth0)
  if (candidate.includes("%")) {
    candidate = candidate.split("%")[0] ?? candidate;
  }

  // Formato [2001:db8::1]:12345
  if (candidate.startsWith("[")) {
    const closeBracket = candidate.indexOf("]");
    if (closeBracket === -1) return null;
    candidate = candidate.slice(1, closeBracket);
  } else if (candidate.split(":").length === 2 && candidate.includes(".")) {
    // Formato 192.0.2.1:8080
    candidate = candidate.split(":")[0] ?? candidate;
  }

  // Remove prefixo IPv4-mapped IPv6 (::ffff:a.b.c.d)
  if (candidate.toLowerCase().startsWith("::ffff:")) {
    const mappedV4 = candidate.slice(7);
    if (isIP(mappedV4) === 4) {
      return mappedV4;
    }
  }

  const version = isIP(candidate);
  if (version === 4) {
    return candidate;
  }
  if (version === 6) {
    return candidate.toLowerCase();
  }
  return null;
}

/**
 * Verifica se um IP pertence a um bloco CIDR (IPv4 ou IPv6) ou IP exato.
 */
export function ipMatchesCidr(ip: string, cidrOrIp: string): boolean {
  const normalizedTarget = normalizeIp(ip);
  if (!normalizedTarget) return false;

  const trimmedRule = cidrOrIp.trim();
  if (!trimmedRule) return false;

  const [baseIpRaw, prefixRaw] = trimmedRule.includes("/")
    ? trimmedRule.split("/")
    : [trimmedRule, undefined];

  const normalizedBase = normalizeIp(baseIpRaw);
  if (!normalizedBase) return false;

  const targetVersion = isIP(normalizedTarget);
  const baseVersion = isIP(normalizedBase);
  if (targetVersion === 0 || targetVersion !== baseVersion) return false;

  const maxBits = targetVersion === 4 ? 32 : 128;
  const prefixLength =
    prefixRaw !== undefined ? Number(prefixRaw) : maxBits;

  if (
    !Number.isInteger(prefixLength) ||
    prefixLength < 0 ||
    prefixLength > maxBits
  ) {
    return false;
  }

  const targetInt =
    targetVersion === 4
      ? ipv4ToBigInt(normalizedTarget)
      : ipv6ToBigInt(normalizedTarget);
  const baseInt =
    baseVersion === 4
      ? ipv4ToBigInt(normalizedBase)
      : ipv6ToBigInt(normalizedBase);

  if (targetInt === null || baseInt === null) return false;
  if (prefixLength === 0) return true;

  const shift = BigInt(maxBits - prefixLength);
  return (targetInt >> shift) === (baseInt >> shift);
}

/**
 * Verifica se o IP pertence a faixas privadas, loopback, link-local ou reservadas.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const normalized = normalizeIp(ip);
  if (!normalized) return true;

  const reservedCidrs = [
    "127.0.0.0/8",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "169.254.0.0/16",
    "100.64.0.0/10", // CGNAT interno de provedor (não roteável na internet pública)
    "0.0.0.0/8",
    "::1/128",
    "fc00::/7",
    "fe80::/10",
  ];

  return reservedCidrs.some((cidr) => ipMatchesCidr(normalized, cidr));
}

function isTrustedProxy(
  ip: string,
  trustedProxyCidrs: string[],
): boolean {
  return trustedProxyCidrs.some((cidr) => ipMatchesCidr(ip, cidr));
}

export interface IpConfigValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Valida a configuração de extração de IP considerando a topologia real do Traefik em Docker.
 * Alerta caso faixas privadas amplas (/8, /12, /16) sejam usadas em vez do IP/CIDR restrito
 * do container Traefik, e lembra que testes simulados de cabeçalho não substituem a inspeção
 * da rede Docker real (`docker network inspect`) e do `forwardedHeaders` na VPS.
 */
export function validateIpExtractionConfig(
  options: IpExtractionOptions,
): IpConfigValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!Array.isArray(options.trustedProxyCidrs) || options.trustedProxyCidrs.length === 0) {
    errors.push(
      "trustedProxyCidrs não pode ser vazio quando o serviço opera atrás do Traefik.",
    );
  } else {
    for (const entry of options.trustedProxyCidrs) {
      const trimmed = entry.trim();
      const [baseIp, prefixStr] = trimmed.includes("/")
        ? trimmed.split("/")
        : [trimmed, undefined];
      const norm = normalizeIp(baseIp);
      const version = norm ? isIP(norm) : 0;

      if (!norm || version === 0) {
        errors.push(`CIDR/IP confiável inválido em trustedProxyCidrs: "${entry}"`);
        continue;
      }

      const maxBits = version === 4 ? 32 : 128;
      const prefix = prefixStr !== undefined ? Number(prefixStr) : maxBits;
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > maxBits) {
        errors.push(`Prefixo CIDR inválido em trustedProxyCidrs: "${entry}"`);
        continue;
      }

      if (version === 4 && prefix < 24) {
        warnings.push(
          `CIDR "${trimmed}" (/${prefix}) é amplo demais para rede Docker e permite spoofing lateral por outros containers na mesma sub-rede. Prefira /32 do container Traefik ou sub-rede dedicada.`,
        );
      }
      if (version === 6 && prefix < 64) {
        warnings.push(
          `CIDR IPv6 "${trimmed}" (/${prefix}) é amplo demais. Prefira /128 do proxy reverso.`,
        );
      }
    }
  }

  if (
    !Number.isInteger(options.maxTrustedProxyHops) ||
    options.maxTrustedProxyHops < 1 ||
    options.maxTrustedProxyHops > 5
  ) {
    errors.push("maxTrustedProxyHops deve ser um inteiro entre 1 e 5.");
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Extrai com segurança o IP real do visitante validando a cadeia de proxies:
 *
 * 1. NÃO confia automaticamente em toda a rede privada Docker: verifica se o
 *    `socketRemoteAddress` pertence estritamente a `options.trustedProxyCidrs`.
 * 2. Se a conexão TCP vier de um peer NÃO confiável, ignora `X-Forwarded-For` e
 *    `X-Real-IP` e sinaliza `spoofAttemptDetected = true` caso esses cabeçalhos estejam presentes.
 *    Se o peer não confiável for um IP privado enviando cabeçalhos de proxy (ex.: container Traefik
 *    cujo IP mudou após recriação no Coolify/Docker), sinaliza também `ipHeaderMismatch = true`.
 * 3. Se vier do proxy confiável (ex.: Traefik), analisa `X-Forwarded-For` da DIREITA para a ESQUERDA
 *    por posição estrita de salto (Right-to-Left Positional Hop Parsing). Se um salto esperado
 *    à direita for inválido/corrompido, aborta o uso de `X-Forwarded-For` sem jamais deslocar a leitura
 *    para tokens à esquerda (que pertencem ao cliente não confiável).
 * 4. Verifica consistência com `X-Real-IP` (`ipHeaderMismatch`) e bloqueia IPs inválidos, privados
 *    forjados ou que pertençam à própria lista de proxies confiáveis.
 *
 * Nota operacional: testes unitários validam a lógica do parser sob cabeçalhos simulados, mas o
 * comportamento em produção depende da configuração efetiva do Traefik (`forwardedHeaders` e IP
 * real do container na rede Docker da VPS).
 */
export function extractClientIp(
  socketRemoteAddress: string | undefined | null,
  headers: {
    "x-forwarded-for"?: string | string[] | undefined;
    "x-real-ip"?: string | string[] | undefined;
  },
  options: IpExtractionOptions,
): IpExtractionResult {
  const socketIp = normalizeIp(socketRemoteAddress) ?? "0.0.0.0";

  const rawXff = Array.isArray(headers["x-forwarded-for"])
    ? headers["x-forwarded-for"].join(", ")
    : headers["x-forwarded-for"];

  const rawXRealIp = Array.isArray(headers["x-real-ip"])
    ? headers["x-real-ip"][0]
    : headers["x-real-ip"];

  const hasProxyHeaders = Boolean(
    (rawXff && rawXff.trim().length > 0) ||
      (rawXRealIp && rawXRealIp.trim().length > 0),
  );

  // Regra 1: Conexão direta de peer fora da lista de proxies confiáveis
  if (!isTrustedProxy(socketIp, options.trustedProxyCidrs)) {
    const isUnconfiguredPrivateProxyPeer =
      hasProxyHeaders &&
      options.rejectPrivateClientIps &&
      isPrivateOrReservedIp(socketIp);

    return {
      clientIp: socketIp,
      ipSource: "socket_direct",
      ipHeaderMismatch: isUnconfiguredPrivateProxyPeer,
      spoofAttemptDetected: hasProxyHeaders,
    };
  }

  const normalizedRealIp = normalizeIp(rawXRealIp);

  // Regra 2: Processamento posicional Right-to-Left de X-Forwarded-For quando presente
  if (rawXff && rawXff.trim().length > 0) {
    const rawTokens = rawXff
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    const normalizedTokens = rawTokens.map((token) => normalizeIp(token));
    const hadInvalidToken = normalizedTokens.some((norm) => norm === null);
    const maxHops = Math.max(1, options.maxTrustedProxyHops);

    if (normalizedTokens.length > 0) {
      let selectedIndex = normalizedTokens.length - 1;
      let hopsConsumed = 1; // O próprio socketIp já é o 1º proxy confiável
      let chainBrokenAtRight = normalizedTokens[selectedIndex] === null;

      while (
        !chainBrokenAtRight &&
        selectedIndex > 0 &&
        hopsConsumed < maxHops &&
        isTrustedProxy(normalizedTokens[selectedIndex]!, options.trustedProxyCidrs)
      ) {
        if (normalizedTokens[selectedIndex - 1] === null) {
          // O salto imediatamente anterior é malformado: jamais pular para índices mais à esquerda!
          chainBrokenAtRight = true;
          break;
        }
        selectedIndex--;
        hopsConsumed++;
      }

      const candidateIp = !chainBrokenAtRight
        ? normalizedTokens[selectedIndex] ?? null
        : null;

      if (candidateIp) {
        // Se sobraram entradas à esquerda do IP selecionado, o cliente enviou X-Forwarded-For próprio
        const extraLeftHeaders = selectedIndex > 0;
        const candidateIsPrivateOrProxy =
          (options.rejectPrivateClientIps && isPrivateOrReservedIp(candidateIp)) ||
          (options.rejectPrivateClientIps &&
            isTrustedProxy(candidateIp, options.trustedProxyCidrs));

        if (!candidateIsPrivateOrProxy) {
          const ipHeaderMismatch = Boolean(
            normalizedRealIp && normalizedRealIp !== candidateIp,
          );
          return {
            clientIp: candidateIp,
            ipSource: "x_forwarded_for",
            ipHeaderMismatch,
            spoofAttemptDetected: hadInvalidToken || extraLeftHeaders,
          };
        }
      }

      // Se o candidato em XFF era inválido/privado/forjado e X-Real-IP é público e válido, usa X-Real-IP com alerta
      if (
        normalizedRealIp &&
        (!options.rejectPrivateClientIps ||
          (!isPrivateOrReservedIp(normalizedRealIp) &&
            !isTrustedProxy(normalizedRealIp, options.trustedProxyCidrs)))
      ) {
        return {
          clientIp: normalizedRealIp,
          ipSource: "x_real_ip",
          ipHeaderMismatch: true,
          spoofAttemptDetected: true,
        };
      }

      return {
        clientIp: socketIp,
        ipSource: "socket_direct",
        ipHeaderMismatch: true,
        spoofAttemptDetected: true,
      };
    }

    return {
      clientIp: socketIp,
      ipSource: "socket_direct",
      ipHeaderMismatch: false,
      spoofAttemptDetected: true,
    };
  }

  // Regra 3: Sem X-Forwarded-For, mas com X-Real-IP vindo de proxy confiável
  if (normalizedRealIp) {
    if (
      options.rejectPrivateClientIps &&
      (isPrivateOrReservedIp(normalizedRealIp) ||
        isTrustedProxy(normalizedRealIp, options.trustedProxyCidrs))
    ) {
      return {
        clientIp: socketIp,
        ipSource: "socket_direct",
        ipHeaderMismatch: false,
        spoofAttemptDetected: true,
      };
    }

    return {
      clientIp: normalizedRealIp,
      ipSource: "x_real_ip",
      ipHeaderMismatch: false,
      spoofAttemptDetected: false,
    };
  }

  return {
    clientIp: socketIp,
    ipSource: "socket_direct",
    ipHeaderMismatch: false,
    spoofAttemptDetected: false,
  };
}
