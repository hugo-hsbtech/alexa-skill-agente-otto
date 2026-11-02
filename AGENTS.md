# Convenções do projeto Agente Otto

## Configuração privada

- Valores reais desta instalação ficam exclusivamente em .env e na configuração local de Git, nunca em arquivos versionados.
- .env-sample contém somente padrões genéricos e campos específicos vazios; não preencher esse arquivo com dados reais.
- .local/evidence/ guarda as evidências originais privadas. As evidências versionadas têm redações explícitas.
- Não ler ou imprimir o conteúdo de credenciais do gh. A autenticação está em .git/gh/, fora do versionamento; executar gh com GH_CONFIG_DIR apontando para essa pasta local quando necessário.
- O ID real da Skill é OTTO_ALEXA_SKILL_ID; nome do destinatário é OTTO_RECIPIENT_NAME; texto do lembrete é OTTO_REMINDER_TEXT. Não inserir valores reais nos testes, documentação ou exemplos.

## Recuperação local

- Há uma cópia protegida do ambiente fora do repositório. Consulte o caminho com `git config --local --get otto.environmentBackup`.
- A localização padrão deste projeto é `$HOME/.config/agente-otto/.env`; versões anteriores e o bundle pré-limpeza ficam na pasta `backups/` ao lado. Não versionar nem enviar esses backups.
- Manter `.env` e suas cópias com permissão 600 e diretórios privados com 700. Atualizar a cópia externa após mudanças intencionais na configuração; não sobrescrever uma configuração existente sem preservar a versão anterior.
- Essas cópias ficam no mesmo servidor: não substituem backup externo criptografado contra perda do host.

## Git e identidade

- Usar somente user.name e user.email explicitamente configurados no escopo local deste repositório (.git/config). Nunca definir nem usar identidade global como fallback.
- Antes de cada commit, verificar git config --local --get user.name e git config --local --get user.email e conferir que a identidade efetiva não está sobrescrita por variáveis de ambiente ou outro escopo.
- A identidade autorizada deste projeto já está em .git/config; uma cópia de referência está nas variáveis locais OTTO_GIT_USER_NAME e OTTO_GIT_USER_EMAIL.
- Sempre pedir confirmação antes de fazer commit. Se a identidade local estiver ausente, parar e perguntar qual nome/e-mail usar neste projeto.
- Outros projetos podem ter identidades diferentes. Não copiar esta identidade para outro repositório sem orientação explícita.
- Não fazer push, force-push ou reescrever histórico sem autorização. Alterar arquivos atuais não remove valores de commits anteriores, e autor/committer permanecem visíveis em commits públicos.
- Não versionar segredos, cookies, tokens, arquivos .env, .local/ ou node_modules.

## Entrega e implantação

Preservar localmente o código real da Skill, modelo de voz, configuração e instruções. Não apresentar uma exportação parcial como projeto reproduzível completo. O manifesto completo ainda está pendente.

Não alterar o ambiente Alexa já funcionando apenas para espelhar uma mudança local. Antes de implantar a versão parametrizada, verificar como injetar as variáveis no runtime da hospedagem atual. Não enviar o .env local ao console ou ao GitHub. Manter o texto de lembrete estável entre criação e cancelamento para identificar corretamente os testes pendentes.
