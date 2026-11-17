const DEFAULT_CHATBOT_WEBHOOK_URL =
  'https://n8n-mtsmmsupz1vc.jkt4.sumopod.my.id/webhook/dc522045-59c8-4dac-b983-a02e1575e0fb/chat';

export const chatbotConfig = {
  webhookUrl: import.meta.env.VITE_CHATBOT_WEBHOOK_URL?.trim()
    || DEFAULT_CHATBOT_WEBHOOK_URL,
  adminPath: import.meta.env.VITE_ADMIN_PATH?.trim() || '/Admin-PAlasDaun',
  initialMessages: [
    'Selamat datang di Virtual Assistan Alas Daun. ada yang bisa kami bantu?',
  ],
  i18n: {
    en: {
      title: 'Asisten Alas Daun 👋',
      subtitle: 'Selamat datang! Kami siap membantu Anda.',
    },
  },
};
