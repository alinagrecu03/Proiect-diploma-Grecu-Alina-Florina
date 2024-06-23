import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { event_type } from "../utils/utils";

// formularul pentru adaugarea unui eveniment
const AddEvent = (props) => {
    const {
        visibleDialog,
        setVisibleDialog,
        onSubmit
    } = props;
    const userDetails = useSelector(state => state.userDetails.data);
    const [form, setForm] = useState({
        name: "",
        type: ""
    });

    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    const reset = () => {
        setForm({
            name: "",
            type: ""
        });
        setVisibleDialog(false);
    }
    const handleSubmitEvent = () => {
        if (onSubmit) {
            onSubmit(userDetails?.account === "doctor" ? { name: form.name } : form);
        }
        reset();
    }

    return (
        <Dialog header="Schedule an appointment"
            visible={visibleDialog}
            onHide={() => reset()}
        >    
            <div className='event-form'>
                <div className='form-label'>
                    <label htmlFor='name'>
                    { userDetails?.account === "doctor" ? "Title of appointment" : "Describe your problem in a few words"}
                    </label>
                    <InputText name='name' value={ form.name } onChange={(e) => handleFormChange(e.target.value, "name")} />
                </div>
                {
                    userDetails?.account !== "doctor" && (
                        <div className='form-label'>
                            <label htmlFor='type'>Type of intervention (If this is your first appointment we recommend you to select "Dental consultation")</label>
                            <Dropdown
                                name="type"
                                value={form.type}
                                onChange={(e) => handleFormChange(e.value, "type")}
                                options={event_type}
                                optionValue="code"
                                optionLabel="name" 
                                placeholder="Select an intervention"
                            />
                        </div>
                    )
                }
                <div className="event-action-form">
                    <Button label="Add" onClick={() => handleSubmitEvent() } />
                    <br />
                    <Button label="Cancel" className="p-button-text" onClick={() => reset()} />
                </div>
            </div>
        </Dialog>
    )
}

export default AddEvent;