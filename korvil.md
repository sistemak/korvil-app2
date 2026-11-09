# korvil app - instruções para o bolt

## regra de ouro
nunca quebrar o que já funciona. nunca apagar, renomear ou mover arquivo sem pedir. nunca mudar `package.json`, `vite.config`, `tsconfig` ou rotas sem pedir.

## como trabalhar
1. antes de mudar qualquer coisa, leia todo o repositório: pastas, arquivos, códigos, histórico recente.
2. quando o usuário criar, editar, anexar, importar ou atualizar algo direto no github, considere isso como verdade. sincronize e continue a partir dali, sem recriar do zero.
3. verifique instantaneamente: arquivos duplicados, imports quebrados, caminhos errados, componentes sem uso, tipos errados.
4. arrume, ajuste e organize de acordo com o que o usuário pedir, mantendo o mesmo padrão visual e de pastas que já existe.
5. se algo que o usuário subiu direto no github estiver fora do padrão, não apague. adapte e deixe funcionando dentro do padrão do projeto.
6. sempre mostre no final: o que foi lido, o que foi alterado, o que foi mantido intacto.

## estrutura atual
- app principal em `src/`
- seções e telas em `korvil/sections/` quando existirem
- não criar pastas novas fora do padrão sem pedir
- manter nomes de arquivos e componentes como já estão

## estilo
- manter o mesmo design, cores e layout que já existem.
- não trocar biblioteca, não trocar versão, não trocar estilo global.
- todos os nomes de arquivos e pastas sempre em minúsculo.
