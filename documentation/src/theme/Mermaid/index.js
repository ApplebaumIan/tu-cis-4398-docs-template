import React, {useCallback, useEffect, useRef, useState} from 'react';
import OriginalMermaid from '@theme-original/Mermaid';
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  useTransformComponent,
} from 'react-zoom-pan-pinch';
import styles from './styles.module.css';

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

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

function copyDiagramForViewer(container) {
  const svg = container?.querySelector('svg');

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

function MermaidViewerToolbar({onClose, closeButtonRef}) {
  const {zoomIn, zoomOut, centerView} = useControls();
  const scale = useTransformComponent(({state}) => state.scale);

  return (
    <div className={styles.toolbar}>
      <button type="button" className={styles.controlButton} onClick={() => zoomOut()} aria-label="Zoom out" title="Zoom out">
        -
      </button>
      <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
      <button type="button" className={styles.controlButton} onClick={() => zoomIn()} aria-label="Zoom in" title="Zoom in">
        +
      </button>
      <button type="button" className={styles.controlButton} onClick={() => centerView(1)} aria-label="Reset zoom" title="Reset zoom">
        1:1
      </button>
      <button
        type="button"
        className={styles.controlButton}
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close fullscreen diagram"
        title="Close"
      >
        x
      </button>
    </div>
  );
}

function MermaidFullscreenViewer({diagramMarkup, onClose}) {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Fullscreen Mermaid diagram">
      <TransformWrapper
        initialScale={1}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        centerOnInit
        centerZoomedOut
        limitToBounds={false}
        wheel={{step: 0.12}}
        doubleClick={{mode: 'toggle'}}
        panning={{velocityDisabled: true}}
        pinch={{step: 8}}
      >
        <MermaidViewerToolbar onClose={onClose} closeButtonRef={closeButtonRef} />
        <TransformComponent
          wrapperClass={styles.transformWrapper}
          contentClass={styles.transformContent}
          wrapperProps={{'aria-label': 'Pan and zoom Mermaid diagram'}}
        >
          <div
            className={styles.diagram}
            dangerouslySetInnerHTML={{__html: diagramMarkup}}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

function useRenderedMermaidSvg(diagramRef) {
  const [hasRenderedDiagram, setHasRenderedDiagram] = useState(false);

  useEffect(() => {
    const container = diagramRef.current;

    if (!container) {
      return undefined;
    }

    const updateRenderedState = () => {
      setHasRenderedDiagram(Boolean(container.querySelector('svg')));
    };

    updateRenderedState();

    const observer = new MutationObserver(updateRenderedState);
    observer.observe(container, {childList: true, subtree: true});

    return () => observer.disconnect();
  }, [diagramRef]);

  return hasRenderedDiagram;
}

function MermaidOpenBadge({isReady}) {
  if (!isReady) {
    return null;
  }

  return (
    <span className={styles.openBadge} aria-hidden="true">
      Fullscreen
    </span>
  );
}

function getZoomTargetClassName(isReady) {
  return [
    styles.mermaidZoomTarget,
    isReady ? styles.mermaidZoomTargetReady : styles.mermaidZoomTargetPending,
  ].join(' ');
}

// Delegate all diagram rendering to Docusaurus and Mermaid; this wrapper only
// enhances the rendered output after hydration.
export default function MermaidWrapper(props) {
  const diagramRef = useRef(null);
  const [fullscreenDiagram, setFullscreenDiagram] = useState(null);
  const hasRenderedDiagram = useRenderedMermaidSvg(diagramRef);

  const openFullscreen = useCallback(() => {
    const diagramMarkup = copyDiagramForViewer(diagramRef.current);

    if (diagramMarkup) {
      setFullscreenDiagram(diagramMarkup);
    }
  }, []);

  const handleClick = useCallback((event) => {
    if (!hasRenderedDiagram) {
      return;
    }

    if (event.target instanceof Element && event.target.closest('a, button')) {
      return;
    }

    openFullscreen();
  }, [hasRenderedDiagram, openFullscreen]);

  const handleKeyDown = useCallback((event) => {
    if (!hasRenderedDiagram || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    openFullscreen();
  }, [hasRenderedDiagram, openFullscreen]);

  return (
    <>
      <div
        className={getZoomTargetClassName(hasRenderedDiagram)}
        ref={diagramRef}
        role="button"
        tabIndex={hasRenderedDiagram ? 0 : -1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-disabled={!hasRenderedDiagram}
        aria-label="Open Mermaid diagram fullscreen"
        title={hasRenderedDiagram ? 'Open diagram fullscreen' : 'Diagram is still rendering'}
      >
        <OriginalMermaid {...props} />
        <MermaidOpenBadge isReady={hasRenderedDiagram} />
      </div>
      {fullscreenDiagram && (
        <MermaidFullscreenViewer
          diagramMarkup={fullscreenDiagram}
          onClose={() => setFullscreenDiagram(null)}
        />
      )}
    </>
  );
}
