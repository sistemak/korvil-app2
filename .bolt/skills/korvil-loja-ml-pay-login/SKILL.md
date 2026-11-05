---
name: korvil-loja-ml-pay-login
description: "Use when Loja checkout PIX bancos login biometria. Trigger: checkout, pix, bank-search, login unificado, digital, mercado livre. Scope: Loja KORVIL App vbckzfvqarcjadqxmdqc. Boundary: mantém CSS ML 100%, PIX real Neon."
---

HEADER: UserCircle ao lado carrinho + sino + busca autocomplete + input bank-search "Digite seu banco..."

CHECKOUT: BANKS 12 Nubank(nubank://) Itaú Inter Bradesco BB Caixa Santander PicPay MercadoPago C6 Neon Next {deeplink,site}. localStorage korvil-banks-usage ordena Mais usados ★. Click: clipboard pixCode + location deeplink + fallback site. PIX generatePixPayload [korvilloja@gmail.com](mailto:korvilloja@gmail.com) CRC16 válido QRCode qrcode.react Copiar Já paguei update pedidos pago onFocus.

LOGIN: Sempre pede login ao entrar, não mostra conta. Modal 2 btn: "Entrar com conta do App KORVIL" mesma auth.users vbckzfvqarcjadqxmdqc real + "Entrar com outra conta" cadastro novo. Biometria WebAuthn credentials.create/get salva user\_credentials. Logout limpa.

ML: Detail galeria zoom perguntas K-AI perguntas avaliacoes share favoritos frete R$79, lista filtros preço categ aval + sort, carrinho endereço enderecos CEP cupom, Meus Pedidos status real aguardando/pago/enviado, Favoritos, Perguntas.