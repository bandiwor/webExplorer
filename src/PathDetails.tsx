import path from "path";
import React from "react";

function getPathForIndex(pathParts: string[], index: number) {
    return [...pathParts].splice(0, index + 1).join(path.sep);
}

export default function PathDetails({pathParts}: {
    pathParts: string[]
}) {
    return <h1 className={'path'}>{pathParts.map((part, index) =>
        part ?
            <a key={index} data-sep={path.sep} className={'part'}
               href={`?p=${getPathForIndex(pathParts, index)}`}>{part}</a>
            : null
    )}</h1>
}