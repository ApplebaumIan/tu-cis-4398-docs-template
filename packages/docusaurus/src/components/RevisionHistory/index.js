import React, {useEffect, useMemo, useState} from 'react';
import {usePluginData} from '@docusaurus/useGlobalData';
import {useLocation} from '@docusaurus/router';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function normalizePath(value) {
  if (!value) {
    return null;
  }

  return value.replace(/\\/g, '/').replace(/\/+$/, '') || '/';
}

function formatCommitDate(value) {
  if (!value) {
    return 'Unknown date';
  }

  return new Date(value).toLocaleString();
}

export default function RevisionHistory() {
  const location = useLocation();
  const {metadata} = useDoc();
  const {siteConfig} = useDocusaurusContext();
  const pluginData = usePluginData('docusaurus-plugin-revision-history');
  const histories = pluginData?.histories ?? {};
  const pageSize = pluginData?.pageSize ?? 5;
  const organizationName = siteConfig.organizationName;
  const projectName = siteConfig.projectName;

  const historyEntry = useMemo(() => {
    const candidates = [
      location.pathname,
      metadata?.permalink,
      metadata?.source,
      metadata?.source?.replace(/^\.\//, ''),
    ]
      .map(normalizePath)
      .filter(Boolean);

    return candidates
      .map((candidate) => histories[candidate])
      .find(Boolean);
  }, [histories, location.pathname, metadata?.permalink, metadata?.source]);

  if (!historyEntry) {
    return null;
  }

  const history = historyEntry?.history ?? [];
  const error = historyEntry?.error ?? null;
  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [location.pathname]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, page, pageSize]);

  return (
    <>
      <details>
        <summary>
          Revision History
        </summary>
        <table>
          <thead>
            <tr>
              <th scope="row">
                Author
              </th>
              <th scope="row">
                Revision
              </th>
              <th scope="row">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan="3" style={{textAlign: 'center', fontStyle: 'italic', color: '#666'}}>
                  {error}
                </td>
              </tr>
            ) : visibleHistory.length > 0 ? (
              visibleHistory.map((hist) => (
                <tr key={hist.sha}>
                  <th scope="row">
                    {hist.commit.author.name}
                  </th>
                  <td>
                    <a href={`https://github.com/${organizationName}/${projectName}/commit/${hist.sha}`}>
                      {hist.commit.message}
                    </a>
                  </td>
                  <td>
                    {formatCommitDate(hist.commit.author.date)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{textAlign: 'center', fontStyle: 'italic', color: '#666'}}>
                  No revision history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {history.length > pageSize ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem'}}>
            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        ) : null}
      </details>
    </>
  );
}
