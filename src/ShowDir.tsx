import {FileComponent} from "./FileComponent";
import path from "path";
import React from "react";
import {Dirent} from "node:fs";

export default function ShowDir({dirItems, pathQuery}: {
    dirItems: Dirent[],
    pathQuery: string
}) {
    return <div className={'files'} id={'files'}>
        {dirItems.map(item =>
            <FileComponent key={item.name} url={path.join(pathQuery, item.name)}
                           type={item.isFile() ? 'file' : 'folder'}
                           label={item.name.slice(0, 16) + (item.name.length > 16 ? '...' : '')}
                           filename={item.name}
            />)}
    </div>
}