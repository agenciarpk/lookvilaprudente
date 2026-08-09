# LOOK Vila Prudente

Landing page de captação do empreendimento LOOK Vila Prudente, da Solidi Engenharia e
Construções. Briefing recebido da CIA360 (Theo Vinocur) em 31/07/2026.

- **Empreendimento:** LOOK Vila Prudente, Rua das Giestas, 313, Vila Prudente, São Paulo, SP
- **Produto:** torre única, apartamentos de 1 e 2 dormitórios
- **Estágio:** breve lançamento
- **URL prevista:** lookvilaprudente.com.br

## Stack

HTML estático mais uma serverless function na Vercel. Sem build, sem framework. Mesmo padrão
do projeto Paysage Lorena.

```
index.html            pagina unica, 10 secoes
privacidade.html      politica de privacidade (LGPD)
api/lead.js           grava o lead na planilha Google via service account
assets/css/style.css
assets/js/main.js
assets/img/           webp responsivo em 3 larguras (1920, 1200, 760)
```

## Origem das imagens

Nenhuma imagem veio pronta em resolução de web. Todas foram extraídas do
`Folheto_21x21cm_v4.pdf` (anexo do e-mail do briefing), onde estavam embutidas em baixa
resolução (máximo 1500x675 px), e passaram por upscale 4K no Higgsfield (modelo
`bytedance_image_upscale`). Depois foram convertidas para WebP em três larguras.

O logo é a exceção: foi extraído direto dos vetores do PDF, então está nítido em qualquer
tamanho. Versões em `assets/img/logo-look-*.webp` e `logo-look-branco-900.webp`.

Os arquivos originais e o passo a passo ficam em
`~/Desktop/cia360-briefings-2026-07-31/01-lp-look-vila-prudente/`.

**Atenção:** as imagens da pasta do Drive enviada no briefing não foram usadas. Segundo
verificação do cliente, eram de outro empreendimento.

## Configuração antes de publicar

Duas variáveis de ambiente na Vercel (Settings > Environment Variables):

| Variável | O que é |
|---|---|
| `GOOGLE_SA_KEY` | JSON completo da service account, que precisa ser Editora da planilha |
| `SHEET_ID` | ID da planilha Google que recebe os leads |

Colunas da planilha, nesta ordem:
`Data | Nome | E-mail | Telefone | Interesse | Mensagem | Origem`

Sem essas duas variáveis o formulário responde erro 500 e o lead fica apenas no log da função.

## Pendências do cliente

Estão listadas em `../cia360-briefings-2026-07-31/01-lp-look-vila-prudente/PENDENCIAS.md`.
As que afetam a página diretamente:

- **Metragens** das plantas de 1 e 2 dormitórios (há um aviso visível na seção de plantas)
- **Logo da Solidi** e **CRECI** da vendedora, para o rodapé
- **IDs de GTM, Meta Pixel e GA4**, se houver mídia paga
- **Planilha de destino** dos leads e quem recebe a notificação
- Confirmação do **texto jurídico** do rodapé com o jurídico da Solidi

## Rodar local

```bash
npx vercel dev
```

O `api/lead.js` só funciona sob a Vercel (local via `vercel dev`, ou em produção).
Abrir o `index.html` direto no navegador exibe a página, mas o formulário falha.
