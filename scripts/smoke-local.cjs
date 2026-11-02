'use strict';
// Local smoke test only: reads process.env, never contacts Alexa or prints values.
const assert = require('node:assert/strict');
const {createSkill} = require('../lambda/index');
const {escapeXmlCharacters} = require('../lambda/node_modules/ask-sdk-core');
const skillId = process.env.OTTO_ALEXA_SKILL_ID;
assert.ok(skillId && !skillId.includes('REPLACE_'), 'Configure OTTO_ALEXA_SKILL_ID in the local environment');
const recipient = process.env.OTTO_RECIPIENT_NAME || '';
const message = process.env.OTTO_REMINDER_TEXT || 'Este é o aviso de teste do Agente Otto.';
let calls = 0;
const client = {async invoke() { calls++; throw new Error('Network access forbidden in smoke test'); }};
const skill = createSkill(client);
function event(name, attributes = {}) {
  return {version:'1.0',session:{new:false,sessionId:'local-smoke-session',application:{applicationId:skillId},user:{userId:'local-smoke-user'},attributes},context:{System:{application:{applicationId:skillId},user:{userId:'local-smoke-user'},device:{deviceId:'local-smoke-device',supportedInterfaces:{}}}},request:{type:'IntentRequest',requestId:'local-smoke-request',locale:'pt-BR',timestamp:new Date().toISOString(),intent:{name,confirmationStatus:'NONE'}}};
}
(async()=>{
  const hello = await skill.invoke(event('HelloWorldIntent'));
  assert.ok(hello.response.outputSpeech.ssml.includes(escapeXmlCharacters(recipient.trim())));
  const activate = await skill.invoke(event('ActivateAlertsIntent'));
  assert.ok(activate.response.outputSpeech.ssml.includes(escapeXmlCharacters(message.trim())));
  assert.equal(activate.sessionAttributes.pendingTestReminder,true);
  const decline = await skill.invoke(event('AMAZON.NoIntent', activate.sessionAttributes));
  assert.equal(decline.sessionAttributes.pendingTestReminder,undefined);
  assert.equal(calls,0);
  console.log('OK: ambiente local carregado; saudação, ativação e recusa verificadas; valores não exibidos; nenhuma chamada externa.');
})().catch(()=>{ console.error('FAIL: verifique a configuração local; valores omitidos.'); process.exitCode=1; });
