import React from "react";
import { Dialog as PrimeDialog } from 'primereact/dialog';

// componenta pentru dialog bazata pe libraria primereact
export default function Dialog(props) {
    const {
        visible,
        header,
        footer,
        onHide,
        children
    } = props;
    return (
        <PrimeDialog
            visible={visible}
            modal
            header={header}
            footer={footer}
            onHide={onHide}
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
            { children }
        </PrimeDialog>
    )
}