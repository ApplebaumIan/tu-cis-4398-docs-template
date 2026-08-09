import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import OriginalMDXImg from '@theme-original/MDXComponents/Img';
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  useTransformComponent,
} from 'react-zoom-pan-pinch';
import useModalFocusTrap from '@site/src/utils/useModalFocusTrap';
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

function ImagePanZoomControls() {
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

function ImageFullscreenViewer({alt, src, srcSet, sizes, onClose}) {
  const closeButtonRef = useRef(null);
  const dialogRef = useModalFocusTrap({initialFocusRef: closeButtonRef, onClose});

  return (
    <div
      className={styles.overlay}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen image"
      tabIndex={-1}
    >
      <button
        type="button"
        className={`${styles.viewerButton} ${styles.closeButton}`}
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close fullscreen image"
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
        <ImagePanZoomControls />
        <TransformComponent
          wrapperClass={styles.transformWrapper}
          contentClass={styles.transformContent}
          wrapperProps={{'aria-label': 'Pan and zoom image'}}
        >
          <div className={styles.imageFrame}>
            <img
              className={styles.viewerImage}
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt={alt ?? ''}
              draggable="false"
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default function MDXImgWrapper(props) {
  const wrapperRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [isLinkedImage, setIsLinkedImage] = useState(true);
  const {alt, src, srcSet, sizes} = props;
  const canOpen = Boolean(src) && !isLinkedImage;

  const isInsideLink = useCallback(() => Boolean(wrapperRef.current?.closest('a')), []);

  useEffect(() => {
    setIsLinkedImage(isInsideLink());
  }, [isInsideLink]);

  const openFullscreen = useCallback(() => {
    if (canOpen && !isInsideLink()) {
      setFullscreenImage(true);
    }
  }, [canOpen, isInsideLink]);

  const handleClick = useCallback((event) => {
    if (!canOpen || isInsideLink()) {
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
      <span
        className={[
          styles.imageZoomTarget,
          canOpen ? styles.imageZoomTargetReady : styles.imageZoomTargetPending,
        ].join(' ')}
        ref={wrapperRef}
      >
        <span
          className={styles.imageInteractiveTarget}
          role={canOpen ? 'button' : undefined}
          tabIndex={canOpen ? 0 : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-disabled={canOpen ? undefined : true}
          aria-label={canOpen ? 'Open image fullscreen' : undefined}
          title={canOpen ? 'Open image fullscreen' : undefined}
        >
          <OriginalMDXImg {...props} />
        </span>
        {canOpen && (
          <span className={styles.inlineActions} data-image-actions aria-label="Image actions">
            <button
              type="button"
              className={styles.inlineFullscreenButton}
              onClick={openFullscreen}
              aria-label="Open image fullscreen"
              title="Open image fullscreen"
            >
              <FullscreenIcon />
            </button>
          </span>
        )}
      </span>
      {fullscreenImage && typeof document !== 'undefined' && createPortal(
        <ImageFullscreenViewer
          alt={alt}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          onClose={() => setFullscreenImage(false)}
        />,
        document.body,
      )}
    </>
  );
}
