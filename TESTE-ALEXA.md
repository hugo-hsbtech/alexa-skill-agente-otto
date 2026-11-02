# Teste da etapa Alexa

Verificado no simulador oficial da Amazon, idioma pt-BR e estágio Development:

1. Entrada: abrir agente otto
   Saída SSML: <speak>Olá! Eu sou o Agente Otto. Este é o nosso primeiro teste pelo Echo. A conexão com o Hermes ainda não está ativa. Diga olá para testar.</speak>
   shouldEndSession: false

2. Entrada: olá
   Intent reconhecida: HelloWorldIntent
   Saída SSML: <speak>Olá, [destinatário]! O teste de voz do Agente Otto funcionou.</speak>

Os resultados foram lidos do simulador após as solicitações reais. Teste físico no Echo pendente. Integração Hermes ainda não implementada. Nenhum token ou identificador pessoal de requisição foi incluído neste registro.

Nota de privacidade: transcrição histórica com nome do destinatário removido. Original mantido somente na pasta local ignorada .local/evidence/. Esta transcrição refere-se à primeira versão, não à configuração atual.
