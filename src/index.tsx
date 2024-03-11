import React from "react";
import express, {Request, Response} from "express";
import path from "path";
import reactDomServer from "react-dom/server";
import fs from "fs/promises";
import {createReadStream} from "fs";
import {Dirent, Stats} from "node:fs";
import {lookup as mimeTypeLookup} from "mime-types";
import compression from "compression";

const defaultFolder = 'C:/';
const defaultHost = 'localhost';
const defaultPort = 3000;

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(compression());

type FileComponentProps = {
    url: string,
    type: 'file' | 'folder',
    label: string,
    filename: string
};

function FileComponent({type, url, label, filename}: FileComponentProps) {
    return <a data-filename={filename} className={'file'} href={`?p=${url}`}>
        <img width={100} height={100} alt={''} src={type === 'file' ? '/file.svg' : '/folder.svg'}/>
        <span>{label}</span>
    </a>
}

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

function FileDetails({data, filename}: {data: Stats, filename: string}) {
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

function getPathForIndex(pathParts: string[], index: number) {
    return [...pathParts].splice(0, index + 1).join(path.sep);
}

app.get('', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    let pathQuery = String(req.query.p || defaultFolder);

    let isDir: boolean;
    let dirItems: Dirent[] = [];
    let fileDetails: Stats | null = null;

    try {
        const stats = await fs.lstat(pathQuery)
        isDir = stats.isDirectory();
    } catch (e) {
        res.status(404).end(`Not found: ${pathQuery}`);
        return;
    }

    if (isDir) {
        if (pathQuery.endsWith(':')) {
            pathQuery += path.sep;
        }

        dirItems = await fs.readdir(pathQuery, {withFileTypes: true});
    } else {
        fileDetails = await fs.stat(pathQuery, {
            bigint: false
        });
    }

    let pathParts = pathQuery.split(path.sep);
    const filename = pathParts[pathParts.length - 1];

    const renderedHtml = '<!DOCTYPE html>'+reactDomServer.renderToString(<html lang={'en'}>
    <head data-is-file={!isDir}>
        <meta httpEquiv="X-UA-Compatible" content="ie=edge"/>
        <meta charSet="UTF-8"/>
        <meta name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0"/>
        <meta name="description" content="My computer file explorer."/>
        <title>{pathQuery}</title>
        <link rel="stylesheet" href="/styles.css"/>
        <script src={'/script.js'} async={true}></script>
    </head>
    <body>
    {isDir && (
        <div style={{display: 'none'}} id={'search-modal'}>
            <input defaultValue={''} id={'search-input'} type={'text'} placeholder={'...'}/>
        </div>
    )}
    <main className={'main'}>
        <h1 className={'path'}>{pathParts.map((part, index) =>
            part ?
                <a key={index} data-sep={path.sep} className={'part'}
                   href={`?p=${getPathForIndex(pathParts, index)}`}>{part}</a>
                : null
        )}</h1>
        {
            isDir ? (
                <div className={'files'} id={'files'}>
                    {dirItems.map(item =>
                        <FileComponent key={item.name} url={path.join(pathQuery, item.name)}
                                       type={item.isFile() ? 'file' : 'folder'}
                                       label={item.name.slice(0, 16) + (item.name.length > 16 ? '...' : '')}
                                       filename={item.name}
                        />)}
                </div>
            ) : (
                <div className={'file_details'}>
                    <div className={'top_menu'}>
                        <a className={'icon_link'} href={`/open?open=dl&filename=${filename}&mime=${mimeTypeLookup(filename)}&p=${pathQuery}`}>
                            <img width={32} height={32} src="/download.svg" alt=""/>
                            <span>Download</span>
                        </a>
                        <h1 className={'filename'}>{filename}</h1>
                        <a className={'icon_link'} href={`/open?open=view&filename=${filename}&mime=${mimeTypeLookup(filename)}&p=${pathQuery}`} target={'_blank'}>
                            <img width={32} height={32} src="/show.svg" alt=""/>
                            <span>Open</span>
                        </a>
                    </div>
                    {
                        !!fileDetails && <FileDetails data={fileDetails} filename={filename}/>
                    }
                </div>
            )
        }
    </main>
    </body>
    </html>);

    res.setHeader('Content-Length', renderedHtml.length);
    res.status(200).end(renderedHtml);
});

app.get('/open', async (req: Request, res: Response) => {
    const pathQuery = String(req.query.p || '');
    if (!pathQuery) {
        return void res.status(400).end('file not found');
    }
    const filename = String(req.query.filename || pathQuery.split(path.sep).at(-1));
    const openType = String(req.query.open || 'dl');
    const mimeType = String(req.query.mime || undefined);

    res.setHeader("Content-Disposition", `${openType === 'dl' ? 'attachment' : 'inline'}; filename="${filename}"`);

    res.setHeader("Content-Type", mimeType);
    let fileStat: Stats;

    try {
        fileStat = await fs.stat(pathQuery, {bigint: false});
        if (!fileStat.isFile()) {
            throw new Error();
        }
    } catch (e) {
        return void res.status(400).end('file not exists.');
    }

    res.setHeader("Content-Length", `${fileStat.size}`);

    try {
        const fileStream = createReadStream(pathQuery);
        res.status(200);
        fileStream.pipe(res);
    } catch (e) {
        res.status(400).end("Can't download.");
        return;
    }
});

app.listen(defaultPort, defaultHost, () => {
    console.log(`server started on http://${defaultHost}:${defaultPort}`)
})
