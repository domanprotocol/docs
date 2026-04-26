// docmd.config.js
export default defineConfig({
  // --- Core Metadata ---
  title: 'DOMAN Docs',
  url: 'https://doman-docs.vercel.app',

  // --- Branding ---
  logo: {
    light: 'assets/images/logo.png',
    dark: 'assets/images/logo.png',
    alt: 'DOMAN — Web3 Security & Decision Engine',
    href: '/',
  },
  favicon: 'assets/favicon.png',

  // --- Source & Output ---
  src: 'docs',
  out: 'site',

  // --- Layout & UI Architecture ---
  layout: {
    spa: true,
    header: {
      enabled: true,
    },
    breadcrumbs: true,
    sidebar: {
      collapsible: true,
      defaultCollapsed: false,
    },
    optionsMenu: {
      position: 'header',
      components: {
        search: true,
        themeSwitch: true,
        sponsor: null,
      }
    },
    footer: {
      style: 'minimal',
      content: '© ' + new Date().getFullYear() + ' DOMAN — Web3 Security & Decision Engine for Base Chain.',
      branding: false
    }
  },

  // --- Theme Settings ---
  theme: {
    name: 'default',
    appearance: 'dark',
    codeHighlight: true,
    customCss: ['assets/css/doman-theme.css'],
  },

  // --- General Features ---
  minify: true,
  autoTitleFromH1: true,
  copyCode: true,
  pageNavigation: true,

  customJs: ['assets/js/font-preload.js'],

  // --- Navigation (Sidebar) ---
  navigation: [
    { title: 'Introduction', path: '/', icon: 'home' },
    {
      title: 'Dashboard',
      icon: 'layout-dashboard',
      collapsible: true,
      children: [
        { title: 'Overview', path: '/dashboard/', icon: 'eye' },
        { title: 'Getting Started', path: '/dashboard/getting-started', icon: 'rocket' },
        { title: 'Routing & Pages', path: '/dashboard/routing-pages', icon: 'file' },
        { title: 'API Routes', path: '/dashboard/api-routes', icon: 'server' },
        { title: 'Services', path: '/dashboard/services', icon: 'cog' },
        { title: 'Blockchain', path: '/dashboard/blockchain', icon: 'link' },
        { title: 'Database & State', path: '/dashboard/database', icon: 'database' },
        { title: 'Scam Detection', path: '/dashboard/scam-detection', icon: 'shield' },
        { title: 'Components & Style', path: '/dashboard/components', icon: 'palette' },
        { title: 'Data Flows & Testing', path: '/dashboard/data-flows', icon: 'activity' },
      ],
    },
    {
      title: 'Browser Extension',
      icon: 'puzzle',
      collapsible: true,
      children: [
        { title: 'Overview', path: '/extension/', icon: 'eye' },
        { title: 'Components', path: '/extension/components', icon: 'layers' },
        { title: 'Utilities & Types', path: '/extension/utilities', icon: 'wrench' },
        { title: 'Data Flows', path: '/extension/data-flows', icon: 'activity' },
        { title: 'dApp Security', path: '/extension/security', icon: 'shield' },
        { title: 'Wallet System', path: '/extension/wallet', icon: 'wallet' },
        { title: 'Features', path: '/extension/features', icon: 'zap' },
        { title: 'API & Testing', path: '/extension/api-and-testing', icon: 'server' },
        { title: 'Design Guide', path: '/extension/EXTENSION_DESIGN_GUIDE', icon: 'palette' },
      ],
    },
  ],

  // --- Plugins ---
  plugins: {
    seo: {
      defaultDescription: 'DOMAN — Community-Powered Security & Decision Engine for Base Chain. Documentation for Dashboard and Browser Extension.',
      openGraph: { defaultImage: '' },
      twitter: { cardType: 'summary_large_image' }
    },
    sitemap: { defaultChangefreq: 'weekly' },
    analytics: {},
    llms: {},
    pwa: {
      logo: 'assets/images/icon.png',
      themeColor: '#3B82F6',
      bgColor: '#000000',
    },
  },

  // --- Edit Link ---
  editLink: {
    enabled: false,
    baseUrl: '',
    text: 'Edit this page'
  }
});
