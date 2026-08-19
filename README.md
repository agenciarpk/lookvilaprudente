# LOOK Vila Prudente

Landing page de captação do empreendimento LOOK Vila Prudente, da Solidi Engenharia e
Construções.

- **Empreendimento:** LOOK Vila Prudente, Rua das Giestas, 313, Vila Prudente, São Paulo, SP
- **Produto:** torre única, apartamentos de 1 e 2 dormitórios
- **Estágio:** breve lançamento
- **URL:** lookvilaprudente.com.br

## Stack

HTML estático mais uma serverless function na Vercel. Sem build, sem framework.

```
index.html            pagina unica, 10 secoes
privacidade.html      politica de privacidade (LGPD)
api/lead.js           grava o lead na planilha Google via service account
assets/css/style.css
assets/js/main.js
assets/img/           webp responsivo em 3 larguras (1920, 1200, 760)
```

## Configuração antes de publicar

Duas variáveis de ambiente na Vercel (Settings > Environment Variables):

| Variável | O que é |
|---|---|
| `GOOGLE_SA_KEY` | JSON completo da service account, que precisa ser Editora da planilha |
| `SHEET_ID` | ID da planilha Google que recebe os leads |

Colunas da planilha, nesta ordem:
`Data | Nome | E-mail | Telefone | Interesse | Mensagem | Origem`

Sem essas duas variáveis o formulário responde erro 500 e o lead fica apenas no log da função.

## Rodar local

```bash
npx vercel dev
```

O `api/lead.js` só funciona sob a Vercel (local via `vercel dev`, ou em produção).
Abrir o `index.html` direto no navegador exibe a página, mas o formulário falha.

## Créditos

Desenvolvimento: [Agência RPK](https://www.agenciarpk.com/)
