import React from "react";

export default function IconLink({imgSrc, alt, children, ...props}: {
    href: string,
    imgSrc: string,
    alt?: string,
    children: string,
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return <a className={'icon_link'} {...props}>
        <img width={32} height={32} src={imgSrc} alt={alt || ""}/>
        <span>{children}</span>
    </a>
}
