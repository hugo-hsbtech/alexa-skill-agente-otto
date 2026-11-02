'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSkill: factory } = require('../lambda/index');
// Tests never consume the operator's environment or real skill identifier.
const createSkill = api => factory(api, {});
const SKILL = 'amzn1.ask.skill.fixture';
function envelope(name, attributes = {}) {
  return {version:'1.0',session:{new:false,sessionId:'test-session',application:{applicationId:SKILL},user:{userId:'test-user'},attributes},context:{System:{application:{applicationId:SKILL},user:{userId:'test-user'},device:{deviceId:'test-device',supportedInterfaces:{}},apiEndpoint:'https://api.amazonalexa.com',apiAccessToken:'test-token-not-real'}},request:{type:name==='LaunchRequest'?'LaunchRequest':'IntentRequest',requestId:'test-request',timestamp:new Date().toISOString(),locale:'pt-BR',...(name==='LaunchRequest'?{}:{intent:{name,confirmationStatus:'NONE'}})}};
}
function transport() {
  const calls=[];
  return {calls,async invoke(request){calls.push(request);throw new Error('Unexpected network call');}};
}
test('activation asks for informed confirmation without scheduling',async()=>{
  assert.equal(typeof createSkill,'function','The skill must expose a testable SDK factory');
  const api=transport();
  const out=await createSkill(api).invoke(envelope('ActivateAlertsIntent'));
  assert.match(out.response.outputSpeech.ssml,/um minuto/);
  assert.match(out.response.outputSpeech.ssml,/lembrete/);
  assert.equal(out.sessionAttributes.pendingTestReminder,true);
  assert.equal(out.response.shouldEndSession,false);
  assert.equal(api.calls.length,0);
});
test('yes creates a single relative reminder and verifies it before confirming',async()=>{
  const calls=[];
  const api={async invoke(req){
    calls.push(req);
    if(req.method==='POST')return {statusCode:200,headers:[],body:JSON.stringify({alertToken:'test-alert',status:'ON'})};
    return {statusCode:200,headers:[],body:JSON.stringify({alertToken:'test-alert',status:'ON',alertInfo:{spokenInfo:{content:[{locale:'pt-BR',text:'Este é o aviso de teste do Agente Otto.'}]}}})};
  }};
  const out=await createSkill(api).invoke(envelope('AMAZON.YesIntent',{pendingTestReminder:true}));
  assert.match(out.response.outputSpeech.ssml,/criado/);
  assert.equal(calls.length,2);
  assert.equal(calls[0].method,'POST');
  const body=JSON.parse(calls[0].body);
  assert.equal(body.trigger.type,'SCHEDULED_RELATIVE');
  assert.equal(body.trigger.offsetInSeconds,60);
  assert.equal(body.alertInfo.spokenInfo.content[0].locale,'pt-BR');
  assert.equal(body.pushNotification.status,'DISABLED');
  assert.equal(calls[1].method,'GET');
  assert.match(calls[1].url,/test-alert$/);
  assert.equal(out.sessionAttributes.pendingTestReminder,undefined);
});
test('disable deletes only matching active test reminders and reads back the list',async()=>{
  const text='Este é o aviso de teste do Agente Otto.';
  const calls=[];let removed=false;
  const api={async invoke(req){
    calls.push(req);
    if(req.method==='DELETE'){removed=true;return {statusCode:204,headers:[],body:''};}
    const alerts=[{alertToken:'unrelated',status:'ON',alertInfo:{spokenInfo:{content:[{text:'Outro lembrete'}]}}},{alertToken:'completed',status:'COMPLETED',alertInfo:{spokenInfo:{content:[{text}]}}}];
    if(!removed)alerts.push({alertToken:'ours',status:'ON',alertInfo:{spokenInfo:{content:[{text}]}}});
    return {statusCode:200,headers:[],body:JSON.stringify({totalCount:alerts.length,alerts})};
  }};
  const out=await createSkill(api).invoke(envelope('DisableAlertsIntent'));
  assert.match(out.response.outputSpeech.ssml,/cancelados/);
  assert.deepEqual(calls.map(c=>c.method),['GET','DELETE','GET']);
  assert.match(calls[1].url,/ours$/);
  assert.equal(out.sessionAttributes.pendingTestReminder,undefined);
});
test('permission denied returns a consent card, not a success message',async()=>{
  const api={async invoke(){return {statusCode:403,headers:[],body:JSON.stringify({message:'Forbidden'})};}};
  const out=await createSkill(api).invoke(envelope('AMAZON.YesIntent',{pendingTestReminder:true}));
  assert.equal(out.response.card.type,'AskForPermissionsConsent');
  assert.deepEqual(out.response.card.permissions,['alexa::alerts:reminders:skill:readwrite']);
  assert.match(out.response.outputSpeech.ssml,/aplicativo Alexa/);
  assert.doesNotMatch(out.response.outputSpeech.ssml,/criado/);
});
test('no declines pending reminder without network access',async()=>{
  const api=transport();
  const out=await createSkill(api).invoke(envelope('AMAZON.NoIntent',{pendingTestReminder:true}));
  assert.match(out.response.outputSpeech.ssml,/Nenhum/);
  assert.equal(out.sessionAttributes.pendingTestReminder,undefined);
  assert.equal(api.calls.length,0);
});
for(const name of ['LaunchRequest','AMAZON.YesIntent'])test(name+' alone never schedules a reminder',async()=>{
  const api=transport();await createSkill(api).invoke(envelope(name));assert.equal(api.calls.length,0);
});
module.exports={envelope,transport};
