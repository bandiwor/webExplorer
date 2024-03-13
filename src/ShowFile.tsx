import IconLink from "./IconLink";
import {lookup as mimeTypeLookup} from "mime-types";
import {FileDetails} from "./FileDetails";
import React from "react";
import {Stats} from "node:fs";

export default function ShowFile({filename, fileDetails, pathQuery}: {
    filename: string,
    pathQuery: string,
    fileDetails?: Stats | null
}) {
    return <div className={'file_details'}>
        <div className={'top_menu'}>
            <IconLink
                href={`/open?open=dl&filename=${filename}&mime=${mimeTypeLookup(filename)}&p=${pathQuery}`}
                imgSrc={"/download.svg"}>Download</IconLink>
            <h1 className={'filename'}>{filename}</h1>
            <IconLink
                href={`/open?open=view&filename=${filename}&mime=${mimeTypeLookup(filename)}&p=${pathQuery}`}
                imgSrc={"/show.svg"}
                target={'_blank'}>Open</IconLink>
        </div>
        {
            !!fileDetails && <FileDetails data={fileDetails} filename={filename}/>
        }
    </div>
}