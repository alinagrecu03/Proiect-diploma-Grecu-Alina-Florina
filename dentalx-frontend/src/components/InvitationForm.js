import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
import { useGetUsers } from "../utils/utils";
import { useSelector } from "react-redux";
import { InputTextarea } from "primereact/inputtextarea";

// formular pentru crearea unei invitatii, numai adminul poate sa le creeze
export function AddInvitationForm(props) {
    const {
        labelSubmit,
        submit,
        cancel
    } = props;
    const userDetails = useSelector(state => state.userDetails.data);
    const usersData = useGetUsers(userDetails?.account);
    const [form, setForm] = useState({
        id: "",
        old_doctor: "",
        patient: "",
        new_doctor: ""
    });
    const doctorOldList = usersData?.data?.data?.filter(user => user?.account === "doctor")
    ?.filter(user => user?.userid !== form?.new_doctor)
    ?.map(user => ({
        code: user?.userid,
        name: user?.user_name
    }));
    const doctorNewList = usersData?.data?.data?.filter(user => user?.account === "doctor")
    ?.filter(user => user?.userid !== form?.old_doctor)
    ?.map(user => ({
        code: user?.userid,
        name: user?.user_name
    }));
    const patientList = usersData?.data?.data?.filter(user => user?.account === "patient")?.map(user => ({
        code: user?.userid,
        name: user?.user_name
    }));
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "old_doctor",
        "patient",
        "new_doctor"
    ];
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    const handleCancelEvent = () => {
        setForm({
            id: "",
            old_doctor: "",
            patient: "",
            new_doctor: ""
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit && errorForm.every((errorVal) => !!form?.[errorVal])) {
            submit(form);
            setForm({
                id: "",
                old_doctor: "",
                patient: "",
                new_doctor: ""
            });
            setSubmitEvent(false);
        } else {
            setSubmitEvent(true);
        }
    }
    return (
        <div className="profile-dialog-content full-width">
            <div className='profile-form'>
                <div className='form-label'>
                    <label htmlFor='old_doctor'>Old doctor</label>
                    <Dropdown
                        name="old_doctor"
                        aria-describedby="old_doctor"
                        value={form.old_doctor}
                        onChange={(e) => handleFormChange(e.value, "old_doctor")}
                        options={doctorOldList}
                        optionValue="code"
                        optionLabel="name"
                        invalid={ submitEvent && !form?.old_doctor }
                        placeholder="Select a doctor"
                    />
                    {
                        submitEvent && !form?.old_doctor && (
                            <small id="old_doctor" style={{
                                color: "red"
                            }}>
                                Old doctor is mandatory
                            </small>
                        )
                    }
                </div>
                <div className='form-label'>
                    <label htmlFor='patient'>Patient</label>
                    <Dropdown
                        name="patient"
                        aria-describedby="patient"
                        value={form.patient}
                        onChange={(e) => handleFormChange(e.value, "patient")}
                        options={patientList}
                        optionValue="code"
                        optionLabel="name"
                        invalid={ submitEvent && !form?.patient }
                        placeholder="Select a patient"
                    />
                    {
                        submitEvent && !form?.patient && (
                            <small id="patient" style={{
                                color: "red"
                            }}>
                                Patient is mandatory
                            </small>
                        )
                    }
                </div>
                <div className='form-label'>
                    <label htmlFor='new_doctor'>New doctor</label>
                    <Dropdown
                        name="new_doctor"
                        aria-describedby="new_doctor"
                        value={form.new_doctor}
                        onChange={(e) => handleFormChange(e.value, "new_doctor")}
                        options={doctorNewList}
                        optionValue="code"
                        optionLabel="name"
                        invalid={ submitEvent && !form?.new_doctor }
                        placeholder="Select a doctor"
                    />
                    {
                        submitEvent && !form?.new_doctor && (
                            <small id="new_doctor" style={{
                                color: "red"
                            }}>
                                New doctor is mandatory
                            </small>
                        )
                    }
                </div>
                <Button label={ labelSubmit ?? "Create" } className="my-10" onClick={() => handleSubmitEvent() } />
                {
                    cancel && (
                        <Button label="Cancel" onClick={() => handleCancelEvent() } />
                    )
                }
            </div>
        </div>
    )
}

// formular pentru adaugarea detaliilor unei invitatii, in momentul in care
// un user refuza invitatia el poate sa introduca niste detalii
export function UpdateInvitationForm(props) {
    const {
        data,
        labelSubmit,
        submit,
        cancel
    } = props;
    const [form, setForm] = useState({
        id: "",
        details: "",
    });
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    useEffect(() => {
        if (data) {
            setForm({
                ...data,
                id: data?.id ?? "",
                details: data?.details ?? "",
            })
        }
    }, [data]);
    const handleCancelEvent = () => {
        setForm({
            id: "",
            details: "",
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit) {
            submit(form);
            setForm({
                id: "",
                details: "",
            });
        }
    }
    return (
        <div className="profile-dialog-content full-width">
            <div className='profile-form'>
                <div className='form-label'>
                    <label htmlFor='details'>Details</label>
                    <InputTextarea
                        id="details"
                        aria-describedby="details"
                        value={ form.details }
                        onChange={(e) => handleFormChange(e.target.value, "details")}
                    />
                </div>
                <Button label={ labelSubmit ?? "Update" } onClick={() => handleSubmitEvent() } />
                <br />
                {
                    cancel && (
                        <Button label="Cancel" onClick={() => handleCancelEvent() } />
                    )
                }
            </div>
        </div>
    )
}