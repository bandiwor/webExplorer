import React from "react";

export default function SearchModal({show}: {
    show: boolean
}) {
    if (!show) {
        return null;
    }

    return <div style={{display: 'none'}} id={'search-modal'}>
        <input defaultValue={''} id={'search-input'} type={'text'} placeholder={'...'}/>
    </div>
}