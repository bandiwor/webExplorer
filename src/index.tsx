import React from "react";
import express, {Request, Response} from "express";
import path from "path";
import reactDomServer from "react-dom/server";
import fs from "fs/promises";
import {createReadStream} from "fs";
import {Dirent, Stats} from "node:fs";
import {lookup as mimeTypeLookup} from "mime-types";
import compression from "compression";
import {FileComponent} from "./FileComponent";
import {FileDetails} from "./FileDetails";
import contentDisposition from "content-disposition";
import IconLink from "./IconLink";
import ShowFile from "./ShowFile";
import ShowDir from "./ShowDir";
import PathDetails from "./PathDetails";
import SearchModal from "./SearchModal";


const defaultFolder = 'C:/';
const defaultHost = 'localhost';
const defaultPort = 3000;

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(compression());



app.get('', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    let pathQuery = String(req.query.p || defaultFolder);

    let isDir: boolean;
    let dirItems: Dirent[] = [];
    let fileDetails: Stats | null = null;

    try {
        const stats = await fs.lstat(pathQuery);

        isDir = stats.isDirectory() || stats.isSymbolicLink();
    } catch (e) {
        res.status(404).end(`Not found: ${pathQuery}`);
        return;
    }

    try {
        if (isDir) {
            if (pathQuery.endsWith(':')) {
                pathQuery += path.sep;
            }

            dirItems = await fs.readdir(pathQuery, {withFileTypes: true, encoding: 'utf-8'});
        } else {
            fileDetails = await fs.stat(pathQuery, {
                bigint: false
            });
        }
    } catch (e) {
        res.setHeader('Content-type', 'text/html; charset=utf-8');
        return void res.status(400).end(`${e}`);
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
        <script src="/script.js" async={true}></script>
    </head>
    <body>
    <SearchModal show={isDir}/>
    <main className={'main'}>
        <PathDetails pathParts={pathParts}/>
        {isDir ? (<ShowDir pathQuery={pathQuery} dirItems={dirItems}/>)
                : (<ShowFile fileDetails={fileDetails} filename={filename} pathQuery={pathQuery}/>)}
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

    res.setHeader("Content-Disposition", contentDisposition(filename, {
        type: openType === 'dl' ? 'attachment' : 'inline',
    }));
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
