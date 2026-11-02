'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createSkill} = require('../lambda/index');
function request(name, attributes={}) {
  return {version:'1.0',session:{new:false,sessionId:'fixture-session',application:{applicationId:'amzn1.ask.skill.fixture'},user:{userId:'fixture-user'},attributes},context:{System:{application:{applicationId:'amzn1.ask.skill.fixture'},user:{userId:'fixture-user'},device:{deviceId:'fixture-device',supportedInterfaces:{}},apiEndpoint:'https://api.amazonalexa.com',apiAccessToken:'fixture-token-not-real'}},request:{type:'IntentRequest',requestId:'fixture-request',timestamp:new Date().toISOString(),locale:'pt-BR',intent:{name,confirmationStatus:'NONE'}}};
}
test('instance settings come from environment and are escaped in speech',async()=>{
  const api={async invoke(){throw new Error('No network expected');}};
  const env={OTTO_RECIPIENT_NAME:'Pessoa & Exemplo',OTTO_REMINDER_TEXT:'Aviso & exemplo.'};
  const skill=createSkill(api,env);
  const greeting=await skill.invoke(request('HelloWorldIntent'));
  assert.match(greeting.response.outputSpeech.ssml,/Pessoa &amp; Exemplo/);
  const confirmation=await skill.invoke(request('ActivateAlertsIntent'));
  assert.match(confirmation.response.outputSpeech.ssml,/Aviso &amp; exemplo/);
});
