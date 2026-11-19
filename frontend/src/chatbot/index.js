import { chatbotConfig } from './config';

const CHAT_BUNDLE_URL = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

function isAdminRoute() {
  const adminPath = typeof chatbotConfig.adminPath === 'string'
    ? chatbotConfig.adminPath.replace(/\/+$/, '')
    : '';
  if (!adminPath) return false;
  return window.location.pathname === adminPath
    || window.location.pathname === `${adminPath}/`
    || window.location.hash === `#${adminPath}`
    || window.location.hash.startsWith(`#${adminPath}/`);
}

async function initChat() {
  const chatOptions = {
    webhookUrl: chatbotConfig.webhookUrl,
    initialMessages: chatbotConfig.initialMessages,
    i18n: chatbotConfig.i18n,
  };

  try {
    const { createChat } = await import(/* @vite-ignore */ CHAT_BUNDLE_URL);
    createChat(chatOptions);
  } catch (error) {
    console.error('Chatbot Alas Daun gagal dimuat.', error);
  }
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
