import React, {useCallback} from 'react';
import OriginalMDXImg from '@docusaurus/theme-classic/lib/theme/MDXComponents/Img';
import ZoomableMedia from '../../../components/ZoomableMedia';

export default function MDXImgWrapper(props) {
  const {alt, src, srcSet, sizes} = props;

  const getFullscreenContent = useCallback(() => {
    if (!src) {
      return null;
    }

    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt ?? ''}
        draggable="false"
      />
    );
  }, [alt, sizes, src, srcSet]);

  return (
    <ZoomableMedia
      actionsLabel="Image actions"
      as="span"
      closeLabel="Close fullscreen image"
      copyCode={null}
      dialogLabel="Fullscreen image"
      disableWhenLinked
      getFullscreenContent={getFullscreenContent}
      isReady={Boolean(src)}
      openLabel="Open image fullscreen"
      transformLabel="Pan and zoom image"
      variant="image"
    >
      <OriginalMDXImg {...props} />
    </ZoomableMedia>
  );
}
