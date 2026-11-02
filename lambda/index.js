/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

// Instance values are injected through the environment, never bundled here.
function instanceConfig(input) {
    return input.attributesManager.getRequestAttributes().otto;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Olá! Eu sou o Agente Otto. Diga ativar teste de aviso para agendar um lembrete de teste daqui a um minuto, ou desativar avisos para cancelar os testes pendentes.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const name = instanceConfig(handlerInput).recipientName;
        const speakOutput = `Olá${name ? ', ' + Alexa.escapeXmlCharacters(name) : ''}! O teste de voz do Agente Otto funcionou.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Diga ativar teste de aviso. Vou pedir sua confirmação antes de criar um único lembrete para daqui a um minuto. Para cancelar os testes pendentes, diga desativar avisos.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Até logo!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('Otto session ended');
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        handlerInput.attributesManager.setSessionAttributes({});
        if (error.statusCode === 403 || error.statusCode === 401) {
            return handlerInput.responseBuilder
                .speak('Para criar ou cancelar o aviso de teste, preciso da permissão de lembretes. Abra o aplicativo Alexa e autorize os lembretes do Agente Otto no cartão de permissões. Depois abra a Skill e peça o teste novamente.')
                .withAskForPermissionsConsentCard([REMINDER_SCOPE])
                .withShouldEndSession(true).getResponse();
        }
        const speakOutput = 'Não consegui concluir a operação. Confira os lembretes no aplicativo Alexa antes de tentar novamente.';
        console.log('Otto request failed', error.name || 'Error', error.statusCode || 'unknown');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
const ActivateAlertsIntentHandler = {
    canHandle(input) {
        return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(input.requestEnvelope) === 'ActivateAlertsIntent';
    },
    handle(input) {
        input.attributesManager.setSessionAttributes({pendingTestReminder: true});
        return input.responseBuilder
            .speak('Posso criar um único lembrete para daqui a um minuto, dizendo: ' + Alexa.escapeXmlCharacters(instanceConfig(input).reminderText) + ' Diga sim ou não.')
            .reprompt('Deseja criar esse lembrete de teste para daqui a um minuto?')
            .getResponse();
    }
};

const REMINDER_SCOPE = 'alexa::alerts:reminders:skill:readwrite';

const ConfirmReminderIntentHandler = {
    canHandle(input) {
        return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(input.requestEnvelope) === 'AMAZON.YesIntent';
    },
    async handle(input) {
        const TEST_REMINDER_TEXT = instanceConfig(input).reminderText;
        const pending = input.attributesManager.getSessionAttributes().pendingTestReminder;
        input.attributesManager.setSessionAttributes({});
        if (!pending) {
            return input.responseBuilder.speak('Nenhum lembrete foi criado. Para começar, diga ativar teste de aviso.').getResponse();
        }
        const client = input.serviceClientFactory.getReminderManagementServiceClient();
        const created = await client.createReminder({
            requestTime: new Date().toISOString(),
            trigger: {type: 'SCHEDULED_RELATIVE', offsetInSeconds: 60},
            alertInfo: {spokenInfo: {content: [{locale: 'pt-BR', text: TEST_REMINDER_TEXT}]}},
            pushNotification: {status: 'DISABLED'}
        });
        // Read back the exact reminder before announcing success.
        try {
            const verified = await client.getReminder(created.alertToken);
            if (verified.status !== 'ON' || !verified.alertInfo.spokenInfo.content.some(c => c.text === TEST_REMINDER_TEXT)) {
                throw new Error('Reminder verification failed');
            }
        } catch (_) {
            return input.responseBuilder.speak('O pedido foi enviado, mas não consegui confirmar o lembrete. Confira os lembretes no aplicativo Alexa antes de tentar novamente.').getResponse();
        }
        return input.responseBuilder
            .speak('Lembrete de teste criado para daqui a um minuto: ' + Alexa.escapeXmlCharacters(TEST_REMINDER_TEXT) + ' Para cancelar antes de tocar, abra o Agente Otto e diga desativar avisos.')
            .withSimpleCard('Aviso de teste do Agente Otto', 'Um único lembrete foi agendado para daqui a um minuto. ' + TEST_REMINDER_TEXT)
            .withShouldEndSession(true).getResponse();
    }
};

const DisableAlertsIntentHandler = {
    canHandle(input) {
        return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(input.requestEnvelope) === 'DisableAlertsIntent';
    },
    async handle(input) {
        const TEST_REMINDER_TEXT = instanceConfig(input).reminderText;
        input.attributesManager.setSessionAttributes({});
        const client = input.serviceClientFactory.getReminderManagementServiceClient();
        const matching = r => r.status === 'ON' && r.alertInfo && r.alertInfo.spokenInfo
            && r.alertInfo.spokenInfo.content.some(c => c.text === TEST_REMINDER_TEXT);
        const list = await client.getReminders();
        for (const reminder of (list.alerts || []).filter(matching)) {
            await client.deleteReminder(reminder.alertToken);
        }
        const verified = await client.getReminders();
        if ((verified.alerts || []).some(matching)) {
            return input.responseBuilder.speak('Não consegui confirmar o cancelamento. Confira os lembretes no aplicativo Alexa.').getResponse();
        }
        return input.responseBuilder.speak('Os avisos de teste pendentes foram cancelados. Nenhum novo aviso será criado sem sua ativação e confirmação.').withShouldEndSession(true).getResponse();
    }
};

const DeclineReminderIntentHandler = {
    canHandle(input) {
        return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(input.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(input) {
        input.attributesManager.setSessionAttributes({});
        return input.responseBuilder.speak('Nenhum novo lembrete foi criado. Para cancelar um teste já agendado, diga desativar avisos.').reprompt('Você pode dizer desativar avisos ou sair.').getResponse();
    }
};

exports.createSkill = (apiClient = new Alexa.DefaultApiClient(), env = process.env) => Alexa.SkillBuilders.custom()
    .withApiClient(apiClient)
    .addRequestInterceptors({
        process(input) {
            input.attributesManager.setRequestAttributes({otto: {
                recipientName: (env.OTTO_RECIPIENT_NAME || '').trim(),
                reminderText: (env.OTTO_REMINDER_TEXT || '').trim() || 'Este é o aviso de teste do Agente Otto.'
            }});
        }
    })
    .addRequestHandlers(
        ActivateAlertsIntentHandler,
        ConfirmReminderIntentHandler,
        DisableAlertsIntentHandler,
        DeclineReminderIntentHandler,
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('agente-otto/reminders-poc/v1')
    .create();

exports.handler = async (event) => exports.createSkill().invoke(event);
