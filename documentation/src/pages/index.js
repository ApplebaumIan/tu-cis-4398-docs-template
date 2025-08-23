import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import ProjectReadme from "../components/ReademeMD";
import styles from './index.module.css';
import MDXContent from '@theme/MDXContent';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
            {/* TODO: Change me to your project's tutorial*/ }
          <Link
            className="button button--secondary button--lg"
            to="/tutorial/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}


function Contributors() {
    return <div className={styles.contributors}>
        <a href={`https://github.com/${process.env.ORG_NAME}/${process.env.PROJECT_NAME}/graphs/contributors`}>
            <img src={`https://contrib.rocks/image?repo=${process.env.ORG_NAME}/${process.env.PROJECT_NAME}`}/></a>
            <p>Made with<a href={"https://contrib.rocks"}> contrib.rocks</a>.
        </p>
    </div>;
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
        title={`Hello from ${siteConfig.title}`}
        description="Description will go into a meta tag in <head />">
        <HomepageHeader/>
        <main>
            <MDXContent>
                <ProjectReadme/>
                <Contributors/>
            </MDXContent>
        </main>
    </Layout>
  );
}
