import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Perionyx',
  tagline: 'Enterprise Financial Operating System — Architecture Handbook',
  favicon: 'img/favicon.ico',

  future: {v4: true},

  url: 'https://docs.perionyx.com',
  baseUrl: '/',

  organizationName: 'perionyx',
  projectName: 'perionyx-docs',

  onBrokenLinks: 'warn',

  markdown: {
    format: 'md',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    ['@docusaurus/theme-mermaid', {
      theme: 'dark',
      mermaidConfig: {
        theme: 'dark',
        themeVariables: {
          primaryColor: '#d4af37',
          primaryTextColor: '#e0e0e0',
          primaryBorderColor: '#555',
          lineColor: '#888',
          secondaryColor: '#1a1a2e',
          tertiaryColor: '#16213e',
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
          noteBkgColor: '#1a1a2e',
          noteTextColor: '#d4af37',
          noteBorderColor: '#d4af37',
          actorTextColor: '#d4af37',
          actorBkgColor: '#1a1a2e',
          actorBorder: '#d4af37',
          signalColor: '#aaa',
          signalTextColor: '#ccc',
        },
      },
    }],
  ],

  plugins: [
    ['@easyops-cn/docusaurus-search-local', {
      hashed: true,
      docsRouteBasePath: '/docs',
      indexDocs: true,
      indexBlog: false,
      indexPages: false,
      docsDir: 'docs',
      searchResultLimits: 15,
      searchResultContextMaxLength: 120,
      highlightSearchTermsOnTargetPage: true,
      explicitSearchResultPath: true,
    }],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/perionyx/perionyx/edit/main/docs/site/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-image.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
      disableSwitch: false,
    },
    navbar: {
      title: 'Perionyx',
      logo: {
        alt: 'Perionyx Logo',
        src: 'img/logo.svg',
      },
      style: 'dark',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          href: 'https://github.com/perionyx/perionyx',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Executive Overview', to: '/docs/executive-overview/'},
            {label: 'Architecture', to: '/docs/architecture/system-overview/'},
            {label: 'Financial Platform', to: '/docs/financial-platform/'},
            {label: 'Security', to: '/docs/security/'},
          ],
        },
        {
          title: 'Platform',
          items: [
            {label: 'Treasury', to: '/docs/treasury/'},
            {label: 'Intelligence', to: '/docs/intelligence/'},
            {label: 'Workflow Engine', to: '/docs/workflow-engine/'},
            {label: 'Roadmap', to: '/docs/roadmap/'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: 'https://github.com/perionyx/perionyx'},
            {label: 'Architecture Decision Records', to: '/docs/adrs/'},
            {label: 'Engineering Standards', to: '/docs/engineering-standards/'},
            {label: 'AI Governance', to: '/docs/ai-governance/'},
          ],
        },
      ],
      copyright: `Copyright &copy; ${new Date().getFullYear()} Perionyx, Inc. All rights reserved. Built for enterprise finance.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'bash', 'json', 'yaml', 'typescript', 'sql',
        'python', 'docker', 'toml', 'markdown',
      ],
    },
    metadata: [
      {name: 'author', content: 'Perionyx Engineering'},
      {name: 'description', content: 'Perionyx Enterprise Financial Operating System — Architecture Handbook'},
      {property: 'og:type', content: 'website'},
      {property: 'og:title', content: 'Perionyx Documentation'},
      {property: 'og:description', content: 'Enterprise Financial Operating System — Architecture Handbook v1.0.0'},
      {name: 'robots', content: 'index, follow'},
    ],
    algolia: undefined,
  } satisfies Preset.ThemeConfig,
};

export default config;
