---
name: korvil-adm-editor-master
description: "Use when ADM editor lápis editar produto import. Trigger: adm editar, lápis, importar produto, acesso total. Scope: KORVIL App admin sistemak.srv@gmail.com. Boundary: só ADM vê editar, usuário comum NUNCA."
---

REGRA: Só ADM [sistemak.srv@gmail.com](mailto:sistemak.srv@gmail.com)+ADMIN\_EMAILS vê Pencil Editar.

SE ADM: Em TODO produto marketplace/filtros/busca/favoritos/detail mostra Pencil top-right Editar hover.

Modal ADM Editor: edita valor titulo desc estoque categoria imagens videos + botões +Imagem +Video +Importar Produto .json .csv .xlsx .pdf .zip FileReader extrai dados. Mantém produto atual, tudo anexado vai pra variantes/galeriaInterna \[{id,tipo,url,isPrincipal}\] radio principal preview grid salva produtos real supabase.

Painel ADM: vê todas contas usuários todos pedidos acesso total geral igual ML ADM, bloqueia /admin se não ADM. Usuário comum só vê dele.

Tabelas cria se não existir: pedidos favoritos perguntas avaliacoes enderecos historico produtos variantes jsonb user\_credentials.

Deploy: functions deploy korvil-ai --project-ref vbckzfvqarcjadqxmdqc --no-verify-jwt + build 1x Publish SEM MOCK.