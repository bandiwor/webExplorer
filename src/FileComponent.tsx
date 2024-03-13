import React from "react";
import {FileComponentProps} from "./types";

export function FileComponent({type, url, label, filename}: FileComponentProps) {
    return <a data-filename={filename} className={'file'} href={`?p=${url}`}>
        <img width={100} height={100} alt={''} src={type === 'file' ? '/file.svg' : '/folder.svg'}/>
        <span>{label}</span>
    </a>
}