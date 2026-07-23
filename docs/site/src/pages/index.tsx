import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const sections = [
  {
    title: 'Executive Overview',
    link: '/docs/executive-overview/',
    description: 'Platform vision, philosophy, positioning, and key metrics.',
  },
  {
    title: 'Architecture',
    link: '/docs/architecture/system-overview/',
    description: 'Seven-layer system design and technology stack.',
  },
  {
    title: 'Financial Platform',
    link: '/docs/financial-platform/chart-of-accounts/',
    description: 'Double-entry accounting, ledger, journal entries, and reconciliation.',
  },
  {
    title: 'Treasury',
    link: '/docs/treasury/cash-management/',
    description: 'Cash management, liquidity forecasting, FX, and investments.',
  },
  {
    title: 'Reporting',
    link: '/docs/reporting/financial-statements/',
    description: 'Financial statements, executive dashboard, and analytics.',
  },
  {
    title: 'Integrations',
    link: '/docs/integrations/connector-platform/',
    description: 'Connectors, Plaid, webhooks, and ERP connectivity.',
  },
  {
    title: 'Intelligence',
    link: '/docs/intelligence/intelligence-engines/',
    description: '6 deterministic engines, KPI framework, and scorecards.',
  },
  {
    title: 'Workflow Engine',
    link: '/docs/workflow-engine/workflow-engine/',
    description: 'Orchestration, step executors, approvals, and scheduling.',
  },
  {
    title: 'Security',
    link: '/docs/security/authentication/',
    description: 'Authentication, authorization, encryption, and audit.',
  },
  {
    title: 'Multi-tenancy',
    link: '/docs/multi-tenancy/tenant-isolation/',
    description: 'Tenant isolation and company model.',
  },
  {
    title: 'AI Governance',
    link: '/docs/ai-governance/trust-model/',
    description: 'Trust model, evidence requirements, and principles.',
  },
  {
    title: 'Engineering Standards',
    link: '/docs/engineering-standards/engineering-constitution/',
    description: 'Engineering constitution, performance, and readiness.',
  },
  {
    title: 'ADRs',
    link: '/docs/adrs/adr-list/',
    description: '30 Architecture Decision Records.',
  },
  {
    title: 'Roadmap',
    link: '/docs/roadmap/completed-phases/',
    description: 'Completed phases and future timeline.',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro/">
            Read the Handbook
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/adrs/adr-list/"
            style={{marginLeft: '12px', borderColor: '#d4af37', color: '#d4af37'}}>
            Browse ADRs
          </Link>
        </div>
        <div className={styles.versionBadge}>
          <span className="version-badge">v1.0.0</span>
        </div>
      </div>
    </header>
  );
}

function SectionCard({title, link, description}: {title: string; link: string; description: string}) {
  return (
    <div className={clsx('col col--6', styles.cardCol)}>
      <Link to={link} className={styles.cardLink}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Perionyx Enterprise Financial Operating System — Architecture Handbook">
      <HomepageHeader />
      <main>
        <section className={styles.sectionGrid}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Documentation</h2>
            <div className="row">
              {sections.map((section) => (
                <SectionCard key={section.title} {...section} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
