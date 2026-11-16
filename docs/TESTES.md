# Testes de uso — Orbis web (15/11/2026, noite)

Link testado: https://joaomanoel01s-team-orbis.expo.app (bundle `entry-2002f874…`).
Cenários de falha (NASA fora do ar, GPS simulado) rodaram numa cópia local do **mesmo build**.
Navegador: Chromium (painel do app Claude). Localização do navegador: bloqueada, salvo quando indicado.

## Resultado geral

| # | Bloco | Resultado |
| --- | --- | --- |
| 1 | Carregamento das 4 telas, console e rede | ✅ Sem erros no console; NASA diária e mensal respondem 200; simulador pronto em ~2 s |
| 2 | Navegação pelas abas | ❌ → ✅ **Bug bloqueante encontrado e corrigido**: tocar numa aba não trocava de tela e nenhuma aba aparecia ativa (também na versão da `main`). Corrigido e republicado; testado com cliques reais nas 4 abas e no "voltar" do navegador |
| 3 | Atalhos da tela Início (Clima, Plantações, Caderneta, Ver lavouras, Ver todas, Simular plantio, cartão do carrossel, sino de avisos) | ✅ |
| 4 | Simulador: 4 culturas × 3 cenários × 4 datas (48 combinações) | ✅ Nota sempre coerente com o selo; no Normal a chuva da safra = "antes"; Mais chuva > Normal > Mais seco em todas; soja sem frase de safra; julho mostra a frase "época de plantio da região" |
| 5 | Seletor de data | ✅ Abre o calendário do navegador; respeita mínimo (hoje) e máximo (2096) |
| 6 | Lavouras: cadastrar, validar, filtrar, ver detalhes, anotar serviço, excluir | ✅ Sem nome não salva; filtros contam certo; "Anotar serviço" grava na Caderneta; excluir com Cancelar mantém, com OK remove (e apaga as anotações, como o aviso diz) |
| 7 | Caderneta: registrar, filtrar, excluir | ✅ |
| 8 | Persistência (recarregar a página) | ✅ |
| 9 | NASA fora do ar, sem GPS (Serra Talhada) | ✅ Clima diário em "DEMO" com aviso "Modo de exemplo"; simulador segue com os dados embutidos |
| 10 | NASA fora do ar, GPS em Recife | ✅ Simulador mostra erro; nada inventado |
| 11 | NASA online, GPS em Recife | ✅ Dados reais; sem frases de Serra Talhada; nota pela regra normal |
| 12 | GPS sem resposta | ✅ "Obtendo localização..." e, após 8 s, Serra Talhada |
| 13 | Telas de 320, 360, 430, 768 px e computador | ✅ Sem rolagem lateral; tablet e computador mostram a moldura de celular |

## Achados ainda abertos (não bloqueiam a demo)

1. **Data de cadastro um dia adiantada à noite.** Lavoura cadastrada às ~21h de 15/11 aparece "Plantado em 16 nov" (data gravada em UTC em `src/app/lavouras.tsx`).
2. **Simulador sem "tentar de novo".** Quando a NASA falha fora de Serra Talhada, a mensagem diz "Tente novamente", mas só recarregando a página.
3. **Rota inexistente** mostra a página padrão do Expo em inglês ("Unmatched Route… Sitemap").
4. **Topo da tela com GPS na web** mostra "Coordenadas do aparelho - -8,050, -34,900" (não há nome de cidade no navegador).
5. **Aviso de dados salvos no app** ("usados porque a consulta online falhou") existe em `projection.notes`, mas nenhuma tela o exibe.
6. **UX do simulador:** no cenário Mais chuva, milho 21/01 aparece "Nota 98 · Época boa" ao lado de "faltou chuva em 8 safras" (por desenho: esse cenário não usa o teto do histórico). Com feijão em 11/02, o aviso de melhor época cita **Mar** enquanto a frase cita "21/02 e 01/03".
7. **"Voltar" do navegador** a partir de uma aba volta para Início, não para a aba anterior (comportamento padrão de abas).

## Não testado

- Safari (iPhone) e Firefox.
- Celular físico (Android/iOS) e app nativo (Expo Go).
- Localização real permitida pelo navegador (simulada por injeção na cópia local).
