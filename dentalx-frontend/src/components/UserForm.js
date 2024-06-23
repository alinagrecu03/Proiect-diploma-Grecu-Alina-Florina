import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import React, { useEffect, useState } from "react";

// formular pentru modificarea datelor despre user
export function UpdateUserForm(props) {
    const {
        data,
        labelSubmit,
        submit,
        cancel
    } = props;
    const [form, setForm] = useState({
        email: "",
        firstname: "",
        lastname: ""
    });
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "email",
        "firstname",
        "lastname",
    ];
    useEffect(() => {
        if (data) {
            setForm({
                email: data?.email ?? "",
                firstname: data?.firstname ?? "",
                lastname: data?.lastname ?? ""
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
            email: "",
            firstname: "",
            lastname: "",
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit && errorForm.every((errorVal) => !!form?.[errorVal])) {
            submit(form);
            setForm({
                email: "",
                firstname: "",
                lastname: "",
            });
            setSubmitEvent(false);
        } else {
            setSubmitEvent(true);
        }
    }
    return (
        <div className='profile-form'>
            <div className='form-label'>
                <label
                    htmlFor='firstname'
                    style={{
                        color: submitEvent && !form?.firstname ? "red" : "black"
                    }}
                >Firstname</label>
                <InputText
                    id="firstname"
                    aria-describedby="firstname"
                    value={ form.firstname }
                    invalid={ submitEvent && !form?.firstname }
                    onChange={(e) => handleFormChange(e.target.value, "firstname")}
                />
                {
                    submitEvent && !form?.firstname && (
                        <small
                            id="firstname"
                            style={{
                                color: "red"
                            }}
                        >
                            Firstname is mandatory
                        </small>
                    )
                }
            </div>
            <div className='form-label'>
                <label htmlFor='lastname'
                    style={{
                        color: submitEvent && !form?.firstname ? "red" : "black"
                    }}
                >Lastname</label>
                <InputText
                    id="lastname"
                    aria-describedby="lastname"
                    value={ form.lastname }
                    invalid={ submitEvent && !form?.lastname }
                    onChange={(e) => handleFormChange(e.target.value, "lastname")}
                />
                {
                    submitEvent && !form?.lastname && (
                        <small id="lastname" style={{
                            color: "red"
                        }}>
                            Lastname is mandatory
                        </small>
                    )
                }
            </div>
            <div className='form-label'>
                <label htmlFor='email'
                    style={{
                        color: submitEvent && !form?.firstname ? "red" : "black"
                    }}
                >Email</label>
                <InputText
                    id="email"
                    aria-describedby="email"
                    value={ form.email }
                    invalid={ submitEvent && !form?.email }
                    onChange={(e) => handleFormChange(e.target.value, "email")}
                />
                {
                    submitEvent && !form?.email && (
                        <small id="email" style={{
                            color: "red"
                        }}>
                            Email is mandatory
                        </small>
                    )
                }
            </div>
            <Button label={ labelSubmit ?? "Update" } onClick={() => handleSubmitEvent() } />
            <br />
            {
                cancel && (
                    <Button label="Cancel" onClick={() => handleCancelEvent() } />
                )
            }
        </div>
    );
}

// formular pentru schimbarea parolei
export const UpdatePasswordForm = (props) => {
    const {
        data,
        labelSubmit,
        submit,
        cancel
    } = props;
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: ""
    });
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "oldPassword",
        "newPassword"
    ];
    useEffect(() => {
        if (data) {
            setForm({
                oldPassword: data?.password ?? ""
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
            oldPassword: "",
            newPassword: ""
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit && errorForm.every((errorVal) => !!form?.[errorVal])) {
            submit(form);
            setForm({
                oldPassword: "",
                newPassword: ""
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
                    <label
                        htmlFor='old-password'
                        style={{
                            color: submitEvent && !form?.oldPassword ? "red" : "black"
                        }}
                    >Old password</label>
                    <Password
                        id="old-password"
                        aria-describedby="old-password"
                        value={ form.oldPassword }
                        invalid={ submitEvent && !form?.oldPassword }
                        onChange={(e) => handleFormChange(e.target.value, "oldPassword")}
                        className='form-password-field'
                        toggleMask
                    />
                    {
                        submitEvent && !form?.oldPassword && (
                            <small
                                id="old-password"
                                style={{
                                    color: "red"
                                }}
                            >
                                Old password is mandatory
                            </small>
                        )
                    }
                </div>
                <div className='form-label'>
                    <label htmlFor='new-password'
                        style={{
                            color: submitEvent && !form?.newPassword ? "red" : "black"
                        }}
                    >New password</label>
                    <Password
                        id="new-password"
                        aria-describedby="new-password"
                        value={ form.newPassword }
                        invalid={ submitEvent && !form?.newPassword }
                        onChange={(e) => handleFormChange(e.target.value, "newPassword")}
                        className='form-password-field'
                        toggleMask
                    />
                    {
                        submitEvent && !form?.newPassword && (
                            <small id="new-password" style={{
                                color: "red"
                            }}>
                                New password is mandatory
                            </small>
                        )
                    }
                </div>
                <Button label={ labelSubmit ?? "Change password" } className="my-10" onClick={() => handleSubmitEvent() } />
                {
                    cancel && (
                        <Button label="Cancel" onClick={() => handleCancelEvent() } />
                    )
                }
            </div>
        </div>
    );
}