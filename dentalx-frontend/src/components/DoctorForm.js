import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useState } from "react";

// formular pentru updatarea datelor unui medic
export function UpdateDoctorForm(props) {
    const {
        data,
        labelSubmit,
        submit,
        cancel
    } = props;
    const [form, setForm] = useState({
        degreenumber: "",
        degreeseries: "",
        graduationdate: null,
        college: ""
    });
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "degreenumber",
        "degreeseries",
        "graduationdate",
        "college"
    ];
    useEffect(() => {
        if (data) {
            setForm({
                degreenumber: data?.degreenumber ?? "",
                degreeseries: data?.degreeseries ?? "",
                graduationdate: data?.graduationdate ? new Date(data.graduationdate) : null,
                college: data?.college ?? ""
            });
        }
    }, [data]);
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    const handleCancelEvent = () => {
        setForm({
            degreenumber: "",
            degreeseries: "",
            graduationdate: null,
            college: ""
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit && errorForm.every((errorVal) => !!form?.[errorVal])) {
            submit(form);
            setForm({
                degreenumber: "",
                degreeseries: "",
                graduationdate: null,
                college: ""
            });
            setSubmitEvent(false);
        } else {
            setSubmitEvent(true);
        }
    }
    return (
        <div className='profile-form'>
            <div className='form-label'>
                <label htmlFor='degreenumber'>Profession</label>
                <InputText
                    id="degreenumber"
                    aria-describedby="degreenumber"
                    value={ form.degreenumber }
                    invalid={ submitEvent && !form?.degreenumber }
                    onChange={(e) => handleFormChange(e.target.value, "degreenumber")}
                />
                {
                    submitEvent && !form?.degreenumber && (
                        <small id="degreenumber" style={{
                            color: "red"
                        }}>
                            Profession is mandatory
                        </small>
                    )
                }
            </div>
            <div className='form-label'>
                <label htmlFor='degreeseries'>Specialization</label>
                <InputText
                    id="degreeseries"
                    aria-describedby="degreeseries"
                    value={ form.degreeseries }
                    invalid={ submitEvent && !form?.degreeseries }
                    onChange={(e) => handleFormChange(e.target.value, "degreeseries")}
                />
                {
                    submitEvent && !form?.degreeseries && (
                        <small id="degreeseries" style={{
                            color: "red"
                        }}>
                            Specialization is mandatory
                        </small>
                    )
                }
            </div>
            <div className='form-label'>
                <label htmlFor='graduationdate'>Graduation date</label>
                <Calendar id="graduationdate" value={ form.graduationdate } onChange={(e) => handleFormChange(e.value, "graduationdate")} dateFormat="yy-mm-dd" />
            </div>
            <div className='form-label'>
                <label htmlFor='college'>College</label>
                <InputText
                    id="college"
                    aria-describedby="college"
                    value={ form.college }
                    invalid={ submitEvent && !form?.college }
                    onChange={(e) => handleFormChange(e.target.value, "college")}
                />
                {
                    submitEvent && !form?.college && (
                        <small id="college" style={{
                            color: "red"
                        }}>
                            College is mandatory
                        </small>
                    )
                }
            </div>
            <Button label={ labelSubmit ?? "Register" } onClick={() => handleSubmitEvent() } />
            <br />
            {
                cancel && (
                    <Button label="Cancel" onClick={() => handleCancelEvent() } />
                )
            }
        </div>
    )
}