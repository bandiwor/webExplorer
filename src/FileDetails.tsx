import {Stats} from "node:fs";
import {lookup as mimeTypeLookup} from "mime-types";
import React from "react";

function formatFileSize(size: number): string {
    if (size < 12_000) {
        return `${size}B`
    } else if (size < 12_000_000) {
        return `${(size / 1024).toFixed(3)}KiB`
    } else if (size < 12_000_000_000) {
        return `${(size / 1024 / 1024).toFixed(3)}MiB`
    } else {
        return `${(size / 1024 / 1024).toFixed(3)}GiB`
    }
}


export function FileDetails({data, filename}: {data: Stats, filename: string}) {
    return <div className={'details'}>
        <div className={'detail'}>
            <p>size bytes</p>
            <p>{data.size}</p>
        </div>
        <div className={'detail'}>
            <p>size</p>
            <p>{formatFileSize(data.size)}</p>
        </div>
        <div className={'detail'}>
            <p>mime-type</p>
            <p>{mimeTypeLookup(filename) || 'Unknown'}</p>
        </div>
        <div className={'detail'}>
            <p>create time</p>
            <p>{data.birthtime.toISOString()}</p>
        </div>
        <div className={'detail'}>
            <p>create time ms</p>
            <p>{data.birthtimeMs}</p>
        </div>
        <div className={'detail'}>
            <p>modify time</p>
            <p>{data.mtime.toISOString()}</p>
        </div>
        <div className={'detail'}>
            <p>modify time ms</p>
            <p>{data.mtimeMs}</p>
        </div>
        <div className={'detail'}>
            <p>status changed</p>
            <p>{data.ctime.toISOString()}</p>
        </div>
        <div className={'detail'}>
            <p>status changed ms</p>
            <p>{data.ctimeMs}</p>
        </div>
        <div className={'detail'}>
            <p>access time</p>
            <p>{data.atime.toISOString()}</p>
        </div>
        <div className={'detail'}>
            <p>access time ms</p>
            <p>{data.atimeMs}</p>
        </div>
        <div className={'detail'}>
            <p>dev</p>
            <p>{data.dev}</p>
        </div>
        <div className={'detail'}>
            <p>gid</p>
            <p>{data.gid}</p>
        </div>
        <div className={'detail'}>
            <p>ino</p>
            <p>{data.ino}</p>
        </div>
        <div className={'detail'}>
            <p>blksize</p>
            <p>{data.blksize}</p>
        </div>
        <div className={'detail'}>
            <p>mode</p>
            <p>{data.mode}</p>
        </div>
        <div className={'detail'}>
            <p>nlink</p>
            <p>{data.nlink}</p>
        </div>
        <div className={'detail'}>
            <p>rdev</p>
            <p>{data.rdev}</p>
        </div>
        <div className={'detail'}>
            <p>uid</p>
            <p>{data.uid}</p>
        </div>
    </div>
}