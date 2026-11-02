# Agente Otto

Custom Skill Alexa em pt-BR para provas de conceito de conversa e avisos com opt-in. Integração com o Hermes ainda não implementada.

## Configuração por ambiente

O código público não deve conter valores da instalação, mesmo quando não forem credenciais. Usar:

- `.env`: configuração real local, ignorada pelo Git e com permissão 600.
- `.env-sample`: exemplo versionável com padrões genéricos e campos específicos vazios.
- `.local/evidence/`: evidências originais privadas, ignoradas pelo Git.
- `.git/config`: identidade Git local e remoto desta instalação.
- `.git/gh/`: autenticação do GitHub CLI, fora do conteúdo versionado.

Variáveis:

| Variável | Uso |
| --- | --- |
| `OTTO_ALEXA_SKILL_ID` | Identificador real para operações e smoke test locais; não é credencial. |
| `OTTO_AWS_REGION` | Região da instalação, para referência operacional. |
| `OTTO_RECIPIENT_NAME` | Nome usado no cumprimento; vazio produz uma saudação genérica. |
| `OTTO_REMINDER_TEXT` | Texto em linguagem natural usado no aviso, confirmação e cancelamento. |
| `OTTO_GIT_USER_NAME`, `OTTO_GIT_USER_EMAIL` | Referência local da identidade autorizada; commits continuam exigindo configuração local explícita e confirmação. |
| `OTTO_GITHUB_REPOSITORY` | Destino operacional do projeto, não uma credencial. |
| `GH_CONFIG_DIR` | Pasta local da autenticação do gh; não incluir seu conteúdo em artefatos. |

Não armazenar tokens Alexa: cada requisição fornece o token de sessão necessário à API. Tokens do GitHub continuam no armazenamento local do gh, não no `.env` nem no código.

Para uma instalação nova, copiar `.env-sample` para `.env` e preencher localmente. Não sobrescrever um `.env` já preenchido. No Node local, carregar as variáveis explicitamente com `node --env-file=.env ...`; esse modo foi exercitado neste servidor. O runtime não carrega `.env` automaticamente.

## Estado e limites

- Primeira prova: abertura e cumprimento passaram no simulador e no Echo físico, confirmado pelo usuário.
- Segunda prova: ativação, confirmação e lembrete após um minuto passaram no Echo físico, confirmado pelo usuário.
- A implantação Alexa atual continua na versão anteriormente validada. As alterações locais para ler variáveis de ambiente ainda NÃO foram implantadas no Echo.
- Antes de implantar esta versão, configurar a injeção das variáveis no runtime usado pela hospedagem. Não enviar o `.env` local ao GitHub ou ao editor hospedado. A configuração específica dessa hospedagem ainda precisa ser verificada.
- Sem variáveis, o código usa uma saudação e texto de lembrete genéricos, sem nome pessoal.
- Se alterar `OTTO_REMINDER_TEXT`, o filtro de cancelamento não reconhece lembretes com o texto anterior. Cancelar os testes pendentes antes da troca, ou manter o texto existente no ambiente de execução.
- Teste físico de cancelamento antes de tocar ainda pendente. Não há alertas reais de servidor, disponibilidade persistente nem conversa aberta automaticamente.

## Usar a prova de lembrete

1. Dizer: Alexa, abrir agente otto.
2. Dizer: ativar teste de aviso.
3. A Skill informa texto e atraso de um minuto e pede confirmação.
4. Dizer sim para criar UM lembrete, ou não para não criar.
5. Para cancelar os lembretes de teste pendentes: abrir a Skill e dizer desativar avisos.

Abrir a Skill, dizer sim sem ativação pendente ou responder não não agenda lembretes. A permissão global de Lembretes não substitui a confirmação de cada teste. O aplicativo Alexa precisa autorizar `alexa::alerts:reminders:skill:readwrite`.

A Skill usa o cliente de lembretes do ask-sdk-core. Após criar, faz GET do alertToken antes de anunciar sucesso; após cancelar, lista novamente antes de confirmar. Só cancela lembretes ON criados pela Skill e com texto exato do teste. Falhas de verificação são informadas como incerteza, sem afirmar sucesso.

## Executar e verificar

Da raiz do projeto:

    npm ci --prefix lambda --ignore-scripts --no-audit --no-fund
    node --check lambda/index.js
    node --test test/*.test.js
    node --env-file=.env scripts/smoke-local.cjs

Os testes automatizados usam identificadores fictícios e não dependem do `.env` real. O transporte HTTP é simulado; isso não prova entrega física. O smoke test lê a configuração real local, exercita o roteamento e a montagem de respostas sem chamar a API e sem imprimir os valores.

## Fontes e evidências

- `lambda/index.js`: handlers e configuração por ambiente.
- `lambda/package.json`, `util.js` e `local-debugger.js`: arquivos exportados do template real; `package-lock.json` gerado na instalação local.
- `skill-package/interactionModels/custom/pt-BR.json`: modelo real exportado e atualizado com os intents.
- `test/reminders.test.js`: fluxo de confirmação, agendamento, cancelamento, consentimento e ausência de efeitos sem opt-in.
- `test/environment.test.js`: parametrização e escape SSML.
- `test/simulator-*.json` e `TESTE-ALEXA.md`: registros históricos com nomes pessoais explicitamente removidos, não novas execuções. Originais preservados apenas em `.local/evidence/`.
- O manifesto completo `skill.json` ainda não foi exportado. Isto não é um pacote de implantação autossuficiente.

O template inclui aws-sdk v2 e um depurador legado descontinuado. Não habilitar helpers de logging de envelopes ou URLs assinadas sem revisão. Atualização de dependências/runtime e exportação completa são pendências distintas.

## Privacidade e histórico

A retirada dos valores dos arquivos atuais não remove os valores já publicados no histórico. A limpeza autorizada substitui o commit inicial da branch por uma versão sem os valores da instalação nos arquivos. O nome/e-mail de autor e committer continuam nos metadados do Git, conforme a identidade local autorizada. Commits antigos podem continuar acessíveis por hash, caches, forks ou clones; não é possível garantir sua eliminação apenas com force-push. Nunca publicar o bundle de recuperação que preserva o histórico anterior localmente.

Seguir AGENTS.md para identidade local, revisão e autorização antes de commit/push. Não versionar senhas, cookies, chaves, tokens ou arquivos locais. Nenhum novo endpoint de servidor foi exposto nesta etapa.

## Recuperar o ambiente desta instalação

O `.env` local tem uma segunda cópia protegida fora do repositório, por padrão em `$HOME/.config/agente-otto/.env`. Consulte a localização registrada com:

    git config --local --get otto.environmentBackup

Se o `.env` do projeto estiver ausente, restaure sem sobrescrever um arquivo existente:

    test ! -e .env && install -m 600 "$HOME/.config/agente-otto/.env" .env

Versões datadas e um bundle do histórico anterior ficam em `$HOME/.config/agente-otto/backups/`, protegidos por diretório 700 e arquivos 600. Não publicar esses backups. A cópia de ambiente foi comparada byte a byte ao original, sem imprimir valores. Essas cópias são no mesmo servidor e não cobrem perda total do host; backup externo criptografado permanece fora desta entrega.
