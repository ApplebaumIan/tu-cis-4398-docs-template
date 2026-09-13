import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import {Contributors} from '@tu-cis-courses/docusaurus-components';
import ProjectReadme from '@tu-cis-courses/docusaurus-preset/ProjectReadme';
import styles from './index.module.css';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <header className={`hero hero--primary ${styles.heroBanner}`}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Read documentation
            </Link>
          </div>
        </div>
      </header>
      <main>
        <ProjectReadme />
        <Contributors />
      </main>
    </Layout>
  );
}
