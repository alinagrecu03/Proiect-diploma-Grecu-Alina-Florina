import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React from "react";

// formular pentru stergerea unui eveniment
const CancelEvent = (props) => {
    const {
        visible,
        onHide,
        onSubmit
    } = props;

    return (
        <Dialog header="Edit appointment"
            visible={visible}
            onHide={onHide}
        >
            <div className="event-form">
                <h5>Do you want to remove this appointment ?</h5>
                <Button label="Yes" className="p-button-text" onClick={() => onSubmit()} />
                <br />
                <Button label="No" className="p-button-text" onClick={onHide} />
            </div>
        </Dialog>
    )
}

export default CancelEvent;