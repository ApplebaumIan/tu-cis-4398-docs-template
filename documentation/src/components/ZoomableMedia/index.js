import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
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
import useModalFocusTrap from './useModalFocusTrap';
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

function getClassName(values) {
  return values.filter(Boolean).join(' ');
}

function hasCopyCode(copyCode) {
  return typeof copyCode === 'string' && copyCode.trim().length > 0;
}

function focusWithoutScrolling(element) {
  try {
    element.focus({preventScroll: true});
  } catch {
    element.focus();
  }
}

function copyTextWithTextarea(value) {
  if (typeof document === 'undefined') {
    return;
  }

  const activeElement = document.activeElement;
  const textarea = document.createElement('textarea');

  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  document.body.appendChild(textarea);
  focusWithoutScrolling(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);

    if (activeElement instanceof HTMLElement) {
      focusWithoutScrolling(activeElement);
    }
  }
}

function ZoomableMediaCopyButton({className, copyCode}) {
  const metadata = useMemo(() => createCodeBlockMetadata({
    code: copyCode,
    className: 'language-md',
    language: 'md',
    defaultLanguage: undefined,
    metastring: undefined,
    magicComments: [],
    title: undefined,
    showLineNumbers: undefined,
  }), [copyCode]);

  const wordWrap = useMemo(() => ({
    codeBlockRef: {current: null},
    isEnabled: false,
    isCodeScrollable: false,
    toggle: () => {},
  }), []);

  const handleCopyClick = useCallback((event) => {
    if (!(event.target instanceof Element) || !event.target.closest('button')) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      event.preventDefault();
      event.stopPropagation();
      copyTextWithTextarea(copyCode);
      return;
    }

    void navigator.clipboard.writeText(copyCode).catch(() => {
      copyTextWithTextarea(copyCode);
    });
    window.setTimeout(() => {
      void navigator.clipboard.writeText(copyCode).catch(() => {
        copyTextWithTextarea(copyCode);
      });
    }, 0);
  }, [copyCode]);

  return (
    <div onClickCapture={handleCopyClick}>
      <CodeBlockContextProvider metadata={metadata} wordWrap={wordWrap}>
        <CodeBlockButtons className={className} />
      </CodeBlockContextProvider>
    </div>
  );
}

function ZoomableMediaTopActions({actionsLabel, copyCode}) {
  if (!hasCopyCode(copyCode)) {
    return null;
  }

  return (
    <div className={`${styles.topActions} theme-code-block`} aria-label={actionsLabel}>
      <ZoomableMediaCopyButton
        copyCode={copyCode}
        className={styles.codeBlockButtons}
      />
    </div>
  );
}

function ZoomableMediaInlineActions({
  actionsLabel,
  as,
  copyCode,
  onOpen,
  openLabel,
  variant,
}) {
  const ActionElement = as === 'span' ? 'span' : 'div';
  const includeCopyButton = hasCopyCode(copyCode);
  const actionDataAttributes = {
    'data-zoomable-media-actions': true,
    ...(variant === 'diagram'
      ? {'data-mermaid-actions': true}
      : {'data-image-actions': true}),
  };

  return (
    <ActionElement
      className={getClassName([
        styles.inlineActions,
        includeCopyButton && 'theme-code-block',
      ])}
      aria-label={actionsLabel}
      {...actionDataAttributes}
    >
      <button
        type="button"
        className={styles.inlineFullscreenButton}
        onClick={onOpen}
        aria-label={openLabel}
        title={openLabel}
      >
        <FullscreenIcon />
      </button>
      {includeCopyButton && (
        <ZoomableMediaCopyButton
          copyCode={copyCode}
          className={styles.codeBlockButtons}
        />
      )}
    </ActionElement>
  );
}

function ZoomableMediaPanZoomControls() {
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

function ZoomableMediaViewer({
  actionsLabel,
  closeLabel,
  content,
  copyCode,
  dialogLabel,
  onClose,
  transformLabel,
  variant,
}) {
  const closeButtonRef = useRef(null);
  const dialogRef = useModalFocusTrap({initialFocusRef: closeButtonRef, onClose});

  return (
    <div
      className={styles.overlay}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
      tabIndex={-1}
    >
      <ZoomableMediaTopActions actionsLabel={actionsLabel} copyCode={copyCode} />
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.closeButton}`}
        ref={closeButtonRef}
        onClick={onClose}
        aria-label={closeLabel}
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
        <ZoomableMediaPanZoomControls />
        <TransformComponent
          wrapperClass={styles.transformWrapper}
          contentClass={styles.transformContent}
          wrapperProps={{'aria-label': transformLabel}}
        >
          <div className={styles[`${variant}Frame`]}>
            {content}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default function ZoomableMedia({
  actionsLabel = 'Media actions',
  as = 'div',
  children,
  closeLabel = 'Close fullscreen media',
  copyCode = null,
  dialogLabel = 'Fullscreen media',
  disableWhenLinked = false,
  getFullscreenContent,
  isReady,
  openLabel = 'Open media fullscreen',
  rootRef,
  transformLabel = 'Pan and zoom media',
  variant = 'diagram',
}) {
  const fallbackRootRef = useRef(null);
  const [fullscreenContent, setFullscreenContent] = useState(null);
  const [isLinkedMedia, setIsLinkedMedia] = useState(Boolean(disableWhenLinked));
  const canOpen = Boolean(isReady) && (!disableWhenLinked || !isLinkedMedia);
  const RootElement = as;
  const InteractiveElement = as;

  const setRootRef = useCallback((node) => {
    fallbackRootRef.current = node;

    if (!rootRef) {
      return;
    }

    if (typeof rootRef === 'function') {
      rootRef(node);
    } else {
      rootRef.current = node;
    }
  }, [rootRef]);

  const isInsideLink = useCallback(() => (
    Boolean(disableWhenLinked && fallbackRootRef.current?.closest('a'))
  ), [disableWhenLinked]);

  useEffect(() => {
    if (!disableWhenLinked) {
      setIsLinkedMedia(false);
      return;
    }

    setIsLinkedMedia(isInsideLink());
  }, [disableWhenLinked, isInsideLink]);

  const closeFullscreen = useCallback(() => {
    setFullscreenContent(null);
  }, []);

  const openFullscreen = useCallback(() => {
    if (!canOpen || isInsideLink()) {
      return;
    }

    const nextContent = getFullscreenContent?.();

    if (nextContent) {
      setFullscreenContent(() => nextContent);
    }
  }, [canOpen, getFullscreenContent, isInsideLink]);

  const handleClick = useCallback((event) => {
    if (!canOpen || isInsideLink()) {
      return;
    }

    if (event.target instanceof Element && event.target.closest('a')) {
      return;
    }

    event.preventDefault();
    openFullscreen();
  }, [canOpen, isInsideLink, openFullscreen]);

  const handleKeyDown = useCallback((event) => {
    if (!canOpen || isInsideLink() || event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFullscreen();
    }
  }, [canOpen, isInsideLink, openFullscreen]);

  return (
    <>
      <RootElement
        className={getClassName([
          styles.zoomTarget,
          styles[`${variant}ZoomTarget`],
          canOpen ? styles.zoomTargetReady : styles.zoomTargetPending,
        ])}
        ref={setRootRef}
      >
        <InteractiveElement
          className={getClassName([
            styles.interactiveTarget,
            styles[`${variant}InteractiveTarget`],
          ])}
          role={canOpen ? 'button' : undefined}
          tabIndex={canOpen ? 0 : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={canOpen ? openLabel : undefined}
          title={canOpen ? openLabel : undefined}
        >
          {children}
        </InteractiveElement>
        {canOpen && (
          <ZoomableMediaInlineActions
            actionsLabel={actionsLabel}
            as={as}
            copyCode={copyCode}
            onOpen={openFullscreen}
            openLabel={openLabel}
            variant={variant}
          />
        )}
      </RootElement>
      {fullscreenContent && typeof document !== 'undefined' && createPortal(
        <ZoomableMediaViewer
          actionsLabel={actionsLabel}
          closeLabel={closeLabel}
          content={fullscreenContent}
          copyCode={copyCode}
          dialogLabel={dialogLabel}
          onClose={closeFullscreen}
          transformLabel={transformLabel}
          variant={variant}
        />,
        document.body,
      )}
    </>
  );
}
