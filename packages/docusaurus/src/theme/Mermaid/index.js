import React, {useCallback, useEffect, useRef, useState} from 'react';
import OriginalMermaid from '@docusaurus/theme-mermaid/lib/theme/Mermaid';
import ZoomableMedia from '../../components/ZoomableMedia';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceSvgReferenceIds(value, ids) {
  let nextValue = value;

  ids.forEach((nextId, currentId) => {
    const escapedId = escapeRegExp(currentId);

    nextValue = nextValue
      .replace(new RegExp(`url\\((["']?)#${escapedId}\\1\\)`, 'g'), `url(#${nextId})`)
      .replace(new RegExp(`#${escapedId}(?=["')\\s;]|$)`, 'g'), `#${nextId}`);
  });

  return nextValue;
}

function getSvgRenderedSize(svg) {
  const rect = svg.getBoundingClientRect();

  if (rect.width > 0 && rect.height > 0) {
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number);

  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return {
      width: viewBox[2],
      height: viewBox[3],
    };
  }

  return null;
}

function getDiagramSvg(container) {
  const svgs = Array.from(container?.querySelectorAll('svg') ?? []);
  return svgs.find((svg) => !svg.closest('[data-zoomable-media-actions]')) ?? null;
}

function copyDiagramForViewer(container) {
  const svg = getDiagramSvg(container);

  if (!svg) {
    return null;
  }

  const clone = svg.cloneNode(true);
  const renderedSize = getSvgRenderedSize(svg);
  const suffix = `fullscreen-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const ids = new Map();

  clone.querySelectorAll('[id]').forEach((element) => {
    const currentId = element.getAttribute('id');
    const nextId = `${currentId}-${suffix}`;
    ids.set(currentId, nextId);
    element.setAttribute('id', nextId);
  });

  clone.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const nextValue = replaceSvgReferenceIds(attribute.value, ids);

      if (nextValue !== attribute.value) {
        element.setAttribute(attribute.name, nextValue);
      }
    });
  });

  clone.setAttribute('aria-hidden', 'true');

  if (renderedSize) {
    clone.setAttribute('width', String(Math.ceil(renderedSize.width)));
    clone.setAttribute('height', String(Math.ceil(renderedSize.height)));
  }

  return clone.outerHTML;
}

function formatMermaidMarkdown(value) {
  const source = typeof value === 'string' ? value.trim() : '';

  if (!source) {
    return '';
  }

  return `\`\`\`mermaid\n${source}\n\`\`\``;
}

function getMermaidSource(props) {
  if (typeof props.value === 'string') {
    return props.value;
  }

  if (typeof props.children === 'string') {
    return props.children;
  }

  return '';
}

function useRenderedMermaidSvg(diagramRef) {
  const [hasRenderedDiagram, setHasRenderedDiagram] = useState(false);

  useEffect(() => {
    const container = diagramRef.current;

    if (!container) {
      return undefined;
    }

    const updateRenderedState = () => {
      setHasRenderedDiagram(Boolean(getDiagramSvg(container)));
    };

    updateRenderedState();

    const observer = new MutationObserver(updateRenderedState);
    observer.observe(container, {childList: true, subtree: true});

    return () => observer.disconnect();
  }, [diagramRef]);

  return hasRenderedDiagram;
}

// Delegate all diagram rendering to Docusaurus and Mermaid; this wrapper only
// enhances the rendered output after hydration.
export default function MermaidWrapper(props) {
  const diagramRef = useRef(null);
  const hasRenderedDiagram = useRenderedMermaidSvg(diagramRef);
  const mermaidMarkdown = formatMermaidMarkdown(getMermaidSource(props));

  const getFullscreenContent = useCallback(() => {
    const diagramMarkup = copyDiagramForViewer(diagramRef.current);

    if (!diagramMarkup) {
      return null;
    }

    return <div dangerouslySetInnerHTML={{__html: diagramMarkup}} />;
  }, []);

  return (
    <ZoomableMedia
      actionsLabel="Diagram actions"
      as="div"
      closeLabel="Close fullscreen diagram"
      copyCode={mermaidMarkdown}
      dialogLabel="Fullscreen Mermaid diagram"
      getFullscreenContent={getFullscreenContent}
      isReady={hasRenderedDiagram}
      openLabel="Open Mermaid diagram fullscreen"
      rootRef={diagramRef}
      transformLabel="Pan and zoom Mermaid diagram"
      variant="diagram"
    >
      <OriginalMermaid {...props} />
    </ZoomableMedia>
  );
}
