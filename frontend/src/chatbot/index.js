import { chatbotConfig } from './config';

const CHAT_BUNDLE_URL = 'https://n8n-mtsmmsupz1vc.jkt4.sumopod.my.id/webhook/dc522045-59c8-4dac-b983-a02e1575e0fb/chat';

function isAdminRoute() {
  const adminPath = chatbotConfig.adminPath.replace(/\/+$/, '') || '/Admin-PAlasDaun';
  return window.location.pathname === adminPath
    || window.location.pathname === `${adminPath}/`
    || window.location.hash === `#${adminPath}`
    || window.location.hash.startsWith(`#${adminPath}/`);
}

function initChat() {
  const chatOptions = {
    webhookUrl: chatbotConfig.webhookUrl,
    initialMessages: chatbotConfig.initialMessages,
    i18n: chatbotConfig.i18n,
  };
  const moduleScript = document.createElement('script');
  moduleScript.type = 'module';
  moduleScript.textContent = `
    import { createChat } from '${CHAT_BUNDLE_URL}';
    createChat(${JSON.stringify(chatOptions)});
  `;
  document.body.appendChild(moduleScript);
}

function syncChatVisibility() {
  if (!isAdminRoute()) {
    if (!document.querySelector('n8n-chat')) initChat();
    return;
  }

  document.querySelector('n8n-chat')?.remove();
}

function startChatbot() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncChatVisibility, { once: true });
  } else {
    syncChatVisibility();
  }

  window.addEventListener('popstate', syncChatVisibility);
  window.addEventListener('hashchange', syncChatVisibility);
}

startChatbot();
