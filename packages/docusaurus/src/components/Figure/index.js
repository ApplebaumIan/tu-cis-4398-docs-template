import React from 'react';
// import {Zoom} from 'plugin-image-zoom'
// import 'react-medium-image-zoom/dist/styles.css'

// function WillZoom(props) {
//     return props.noZoom ? <>{props.children}</> : <Zoom>{props.children}</Zoom>
// }

export default function Figure(props) {
    function figureId() {
        if (props.id) {
            return props.id;
        }

        return props.caption
            ? props.caption.replaceAll('.', '-').toLowerCase()
            : undefined;
    }

    return (
        <figure id={figureId()} align={props.align ? props.align : "center"} style={props.style ? props.style : {}}>
                {props.children}
                {props.src ? <img src={props.src} alt={props.alt}/> : <></>}
            <figcaption align={props.align ? props.align : "center"}
                        style={{fontWeight: "bold"}}>{props.caption}
            </figcaption>
            <figcaption align={props.align ? props.align : "center"}
                        style={{}}>{props.subcaption}
            </figcaption>
        </figure>
    )
}
