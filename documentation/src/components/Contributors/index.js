import React, { useState } from 'react';
import styles from './styles.module.css';

export default function Contributors() {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const contributorsImageSrc = imageError
        ? 'https://via.placeholder.com/400x100/f0f0f0/666666?text=Contributors+Not+Available'
        : `https://contrib.rocks/image?repo=${process.env.ORG_NAME}/${process.env.PROJECT_NAME}`;

    const linkHref = imageError
        ? 'tutorial/tutorial-basics/set-environment-variables'
        : `https://github.com/${process.env.ORG_NAME}/${process.env.PROJECT_NAME}/graphs/contributors`;

    return <div className={styles.contributors}>
        <a href={linkHref}>
            <img
                src={contributorsImageSrc}
                alt={imageError ? 'Contributors image not available - click to learn how to set environment variables.' : 'Contributors'}
                onError={handleImageError}
            />
        </a>
        <p>Made with<a href={"https://contrib.rocks"}> contrib.rocks</a>.
        </p>
    </div>;
}

