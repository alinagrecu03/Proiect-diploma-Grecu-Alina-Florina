import React, { useEffect, useState } from "react";
import { Chips } from 'primereact/chips';
import { useSelector } from "react-redux";
import { generatePassword, useGetAccountType } from "../utils/utils";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

// formular pentru adaugarea unui pacient
export function AddPatientForm(props) {
    const {
        submit,
        cancel
    } = props;
    const userDetails = useSelector(state => state.userDetails.data);
    const accountTypes = useGetAccountType();
    const [form, setForm] = useState({
        email: "",
        password: generatePassword(),
        account: "",
        firstname: "",
        lastname: "",
        affections: [],
        treatments: [],
        allergies: [],
        interventions: [],
        doctor: ""
    });
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "email",
        "firstname",
        "lastname",
    ];
    const patientId = (accountTypes?.data?.data ?? [])
    .find((account) => account.type === "patient")?.id;
    useEffect(() => {
        if (patientId) {
            setForm((oldForm) => ({
                ...oldForm,
                account: patientId ?? ""
            }));
        }
    }, [patientId]);
    useEffect(() => {
        if (userDetails?.userid) {
            setForm((oldForm) => ({
                ...oldForm,
                doctor: userDetails?.userid ?? ""
            }));
        }
    }, [userDetails.userid]);
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    const handleCancelEvent = () => {
        setForm({
            email: "",
            password: generatePassword(),
            account: "",
            firstname: "",
            lastname: "",
            affections: [],
            treatments: [],
            allergies: [],
            interventions: [],
            doctor: ""
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
                password: generatePassword(),
                account: "",
                firstname: "",
                lastname: "",
                affections: [],
                treatments: [],
                allergies: [],
                interventions: [],
                doctor: ""
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
                <div className='form-label'>
                    <label htmlFor='password'>Password</label>
                    <InputText
                        id="password"
                        aria-describedby="password"
                        value={ form.password }
                        readOnly
                    />
                    <small id="password">
                        Be sure you copied the password
                    </small>
                </div>
                <div className='form-label'>
                    <label htmlFor='affections'>Affections</label>
                    <Chips name="affections" className="chips" value={ form.affections } onChange={(e) => handleFormChange(e.value, "affections")} />
                </div>
                <div className='form-label'>
                    <label htmlFor='treatments'>Treatments</label>
                    <Chips name="treatments" className="chips" value={ form.treatments } onChange={(e) => handleFormChange(e.value, "treatments")} />
                </div>
                <div className='form-label'>
                    <label htmlFor='allergies'>Allergies</label>
                    <Chips name="allergies" className="chips" value={ form.allergies } onChange={(e) => handleFormChange(e.value, "allergies")} />
                </div>
                <div className='form-label'>
                    <label htmlFor='interventions'>Interventions</label>
                    <Chips name="interventions" className="chips" value={ form.interventions } onChange={(e) => handleFormChange(e.value, "interventions")} />
                </div>
                <Button label="Add" className="my-10" onClick={() => handleSubmitEvent() } />
                <Button label="Cancel" onClick={() => handleCancelEvent() } />
            </div>
        </div>
    );
}

// formular pentru modificarea afectiunilor despre un pacient
export function UpdatePatientForm(props) {
    const {
        data,
        labelSubmit,
        submit,
        cancel
    } = props;
    const [form, setForm] = useState({
        affections: [],
        allergies: [],
        interventions: [],
        treatments: []
    });
    useEffect(() => {
        if (data) {
            setForm({
                affections: data?.affections ?? [],
                allergies: data?.allergies ?? [],
                interventions: data?.interventions ?? [],
                treatments: data?.treatments ?? []
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
            affections: [],
            allergies: [],
            interventions: [],
            treatments: []
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit) {
            submit(form);
            setForm({
                affections: [],
                allergies: [],
                interventions: [],
                treatments: []
            });
        }
    }
    return (
        <div className="profile-dialog-content full-width">
            <div className='profile-form'>
                <div className='form-label'>
                    <label htmlFor='affections'>Affections</label>
                    <Chips name="affections" className="chips" value={ form.affections } onChange={(e) => handleFormChange(e.value, "affections")} />
                </div>
                <div className='form-label'>
                    <label htmlFor='allergies'>Allergies</label>
                    <Chips name="allergies" className="chips" value={ form.allergies } onChange={(e) => handleFormChange(e.value, "allergies")} />
                </div>
                <div className='form-label'>
                    <label htmlFor='interventions'>Interventions</label>
                    <Chips name="interventions" className="chips" value={ form.interventions } onChange={(e) => handleFormChange(e.value, "interventions")} />
                </div>
                <div className='form-label'>
                    <label htmlFor='treatments'>Treatments</label>
                    <Chips name="treatments" className="chips" value={ form.treatments } onChange={(e) => handleFormChange(e.value, "treatments")} />
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
    );
}

// formular pentru adaugarea unor noi afectiuni la un pacient
export function AffectionsForm(props) {
    const {
        patientId,
        formKey,
        keyLabel,
        submit,
        cancel
    } = props;
    const [form, setForm] = useState({
        id: "",
        affections: [],
        allergies: [],
        interventions: [],
        treatments: []
    });
    useEffect(() => {
        if (patientId) {
            setForm((oldForm) => ({
                ...oldForm,
                id: patientId ?? ""
            }));
        }
    }, [patientId]);
    const handleFormChange = (value, field) => {
        setForm((oldForm) => ({
            ...oldForm,
            [field]: value
        }));
    };
    const handleCancelEvent = () => {
        setForm({
            id: "",
            affections: [],
            allergies: [],
            interventions: [],
            treatments: []
        });
        if (cancel) {
            cancel();
        }
    };
    const handleSubmitEvent = () => {
        if (submit && !!form?.[formKey]) {
            submit(form);
            setForm({
                id: "",
                affections: [],
                allergies: [],
                interventions: [],
                treatments: []
            });
        }
    };
    return (
        <div className="profile-dialog-content full-width">
            <div className='profile-form'>
                <div className='form-label'>
                    <label htmlFor={ formKey }>{ keyLabel }</label>
                    <Chips name={ formKey } className="chips" value={ form?.[formKey] } onChange={(e) => handleFormChange(e.value, formKey)} />
                </div>
                <div className="form-actions">
                    <Button label="Add" className="full-width" onClick={() => handleSubmitEvent() } />
                    <br />
                    <Button label="Cancel" className="full-width" onClick={() => handleCancelEvent() } />
                </div>
            </div>
        </div>
    );
}