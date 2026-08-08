import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import OriginalMermaid from '@theme-original/Mermaid';
import {
  CodeBlockContextProvider,
  createCodeBlockMetadata,
} from '@docusaurus/theme-common/internal';
import CodeBlockButtons from '@theme/CodeBlock/Buttons';
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  useTransformComponent,
} from 'react-zoom-pan-pinch';
import styles from './styles.module.css';

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;
const PAN_STEP = 120;

function Icon({children}) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <Icon>
      <path d="M15 6 9 12l6 6" />
    </Icon>
  );
}

function ArrowRightIcon() {
  return (
    <Icon>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

function ArrowUpIcon() {
  return (
    <Icon>
      <path d="m6 15 6-6 6 6" />
    </Icon>
  );
}

function ArrowDownIcon() {
  return (
    <Icon>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

function FullscreenIcon() {
  return (
    <Icon>
      <path d="M7 8 3 12l4 4" />
      <path d="M17 8l4 4-4 4" />
      <path d="M3 12h18" />
    </Icon>
  );
}

function RotateIcon() {
  return (
    <Icon>
      <path d="M3 12a9 9 0 0 1 15.1-6.6" />
      <path d="M18 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.1 6.6" />
      <path d="M6 21v-5h5" />
    </Icon>
  );
}

function XIcon() {
  return (
    <Icon>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

function ZoomInIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21 16.65 16.65" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </Icon>
  );
}

function ZoomOutIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21 16.65 16.65" />
      <path d="M8 11h6" />
    </Icon>
  );
}

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
  return svgs.find((svg) => !svg.closest('[data-mermaid-actions]')) ?? null;
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

function MermaidCopyButton({diagramMarkdown, className}) {
  const metadata = useMemo(() => createCodeBlockMetadata({
    code: diagramMarkdown,
    className: 'language-md',
    language: 'md',
    defaultLanguage: undefined,
    metastring: undefined,
    magicComments: [],
    title: undefined,
    showLineNumbers: undefined,
  }), [diagramMarkdown]);

  const wordWrap = useMemo(() => ({
    codeBlockRef: {current: null},
    isEnabled: false,
    isCodeScrollable: false,
    toggle: () => {},
  }), []);

  return (
    <CodeBlockContextProvider metadata={metadata} wordWrap={wordWrap}>
      <CodeBlockButtons className={className} />
    </CodeBlockContextProvider>
  );
}

function MermaidViewerActions({diagramMarkdown}) {
  return (
    <div className={`${styles.topActions} theme-code-block`} aria-label="Diagram actions">
      <MermaidCopyButton
        diagramMarkdown={diagramMarkdown}
        className={styles.codeBlockButtons}
      />
    </div>
  );
}

function MermaidInlineActions({isReady, diagramMarkdown, onOpen}) {
  if (!isReady) {
    return null;
  }

  return (
    <div
      className={`${styles.inlineActions} theme-code-block`}
      data-mermaid-actions
      aria-label="Diagram actions"
    >
      <button
        type="button"
        className={styles.inlineFullscreenButton}
        onClick={onOpen}
        aria-label="Open Mermaid diagram fullscreen"
        title="Open diagram fullscreen"
      >
        <FullscreenIcon />
      </button>
      <MermaidCopyButton
        diagramMarkdown={diagramMarkdown}
        className={styles.codeBlockButtons}
      />
    </div>
  );
}

function MermaidPanZoomControls() {
  const {zoomIn, zoomOut, setTransform, centerView} = useControls();
  const scale = useTransformComponent(({state}) => state.scale);
  const positionX = useTransformComponent(({state}) => state.positionX);
  const positionY = useTransformComponent(({state}) => state.positionY);

  const panBy = useCallback((deltaX, deltaY) => {
    setTransform(positionX + deltaX, positionY + deltaY, scale, 150);
  }, [positionX, positionY, scale, setTransform]);

  return (
    <div className={styles.panZoomControls} aria-label="Pan and zoom controls">
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.panUp}`}
        onClick={() => panBy(0, PAN_STEP)}
        aria-label="Pan up"
        title="Pan up"
      >
        <ArrowUpIcon />
      </button>
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.panLeft}`}
        onClick={() => panBy(PAN_STEP, 0)}
        aria-label="Pan left"
        title="Pan left"
      >
        <ArrowLeftIcon />
      </button>
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.panReset}`}
        onClick={() => centerView(1)}
        aria-label="Reset view"
        title="Reset view"
      >
        <RotateIcon />
      </button>
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.panRight}`}
        onClick={() => panBy(-PAN_STEP, 0)}
        aria-label="Pan right"
        title="Pan right"
      >
        <ArrowRightIcon />
      </button>
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.panDown}`}
        onClick={() => panBy(0, -PAN_STEP)}
        aria-label="Pan down"
        title="Pan down"
      >
        <ArrowDownIcon />
      </button>
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.zoomIn}`}
        onClick={() => zoomIn()}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <ZoomInIcon />
      </button>
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.zoomOut}`}
        onClick={() => zoomOut()}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <ZoomOutIcon />
      </button>
      <div className={styles.zoomLevel} aria-label={`Zoom level ${Math.round(scale * 100)}%`}>
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

function MermaidFullscreenViewer({diagramMarkup, diagramMarkdown, onClose}) {
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
      <MermaidViewerActions diagramMarkdown={diagramMarkdown} />
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.closeButton}`}
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close fullscreen diagram"
        title="Close"
      >
        <XIcon />
      </button>
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
        <MermaidPanZoomControls />
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
      setHasRenderedDiagram(Boolean(getDiagramSvg(container)));
    };

    updateRenderedState();

    const observer = new MutationObserver(updateRenderedState);
    observer.observe(container, {childList: true, subtree: true});

    return () => observer.disconnect();
  }, [diagramRef]);

  return hasRenderedDiagram;
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
  const mermaidMarkdown = formatMermaidMarkdown(getMermaidSource(props));

  const openFullscreen = useCallback(() => {
    const diagramMarkup = copyDiagramForViewer(diagramRef.current);

    if (diagramMarkup) {
      setFullscreenDiagram({markup: diagramMarkup, markdown: mermaidMarkdown});
    }
  }, [mermaidMarkdown]);

  const handleClick = useCallback((event) => {
    if (!hasRenderedDiagram) {
      return;
    }

    if (
      event.target instanceof Element
      && event.target.closest('a, button, [data-mermaid-actions]')
    ) {
      return;
    }

    openFullscreen();
  }, [hasRenderedDiagram, openFullscreen]);

  return (
    <>
      <div
        className={getZoomTargetClassName(hasRenderedDiagram)}
        ref={diagramRef}
        onClick={handleClick}
        aria-disabled={!hasRenderedDiagram}
        title={hasRenderedDiagram ? 'Open diagram fullscreen' : 'Diagram is still rendering'}
      >
        <OriginalMermaid {...props} />
        <MermaidInlineActions
          isReady={hasRenderedDiagram}
          diagramMarkdown={mermaidMarkdown}
          onOpen={openFullscreen}
        />
      </div>
      {fullscreenDiagram && (
        <MermaidFullscreenViewer
          diagramMarkup={fullscreenDiagram.markup}
          diagramMarkdown={fullscreenDiagram.markdown}
          onClose={() => setFullscreenDiagram(null)}
        />
      )}
    </>
  );
}
