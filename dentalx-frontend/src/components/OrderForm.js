import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import React, { useEffect, useState } from "react";
import { event_type, useGetPatients, useGetStocks } from "../utils/utils";
import { InputTextarea } from "primereact/inputtextarea";
import { Panel } from "primereact/panel";
import { useSelector } from "react-redux";

// formular pentru modificarea unei comenzi
export function UpdateOrderForm(props) {
    const {
        data,
        labelSubmit,
        submit,
        cancel
    } = props;
    const userDetails = useSelector(state => state.userDetails.data);
    const stocksData = useGetStocks(userDetails?.userid);
    const patientData = useGetPatients(userDetails?.account, userDetails?.userid);
    const stockList = stocksData?.data?.data?.map((stock) => ({ code: stock.id, name: stock.name }));
    const patientList = patientData?.data?.data?.map((patient) => ({ code: patient.userid, name: `${patient.firstname} ${patient.lastname}` }));
    const [form, setForm] = useState({
        id: "",
        details: "",
        order_type: "",
        total_price: 0,
        costs_used: {},
        date: null,
        doctor: "",
        patient: ""
    });
    const [submitEvent, setSubmitEvent] = useState(false);
    const errorForm = [
        "order_type",
        "costs_used",
        "total_price",
        "date"
    ];
    useEffect(() => {
        if (data) {
            setForm({
                id: data?.id ?? "",
                details: data?.details ?? "",
                order_type: data?.order_type ?? "",
                total_price: data?.total_price ?? 0,
                costs_used: data?.costs_used ?? {},
                date: data?.date ? new Date(data?.date) : null,
                doctor: data?.doctor ?? "",
                patient: data?.patient ?? ""
            });
        }
    }, [data]);
    const handleFormChange = (value, field, costKey) => {
        if (costKey !== undefined) {
            setForm((oldForm) => {
                const copyCostsUsed = JSON.parse(JSON.stringify(form?.[field]));
                if (costKey === "") {
                    delete copyCostsUsed[costKey];
                    copyCostsUsed[value] = 0;
                } else {
                    copyCostsUsed[costKey] = value;
                }
                return ({
                    ...oldForm,
                    [field]: copyCostsUsed
                })
            });
        } else {
            setForm((oldForm) => ({
                ...oldForm,
                [field]: value
            }));
        }
    };
    const handleCancelEvent = () => {
        setForm({
            id: "",
            details: "",
            order_type: "",
            total_price: 0,
            costs_used: {},
            date: null,
            doctor: "",
            patient: ""
        });
        if (cancel) {
            cancel();
        }
    }
    const handleSubmitEvent = () => {
        if (submit && errorForm.every((errorVal) => errorVal === "costs_used" ? !!(Object.keys(form?.[errorVal])?.every(costKey => !!costKey)
    && Object.values(form?.[errorVal])?.every(costVal => !!costVal)) : !!form?.[errorVal])) {
            submit(form);
            setForm({
                id: "",
                details: "",
                order_type: "",
                total_price: 0,
                costs_used: {},
                date: null,
                doctor: "",
                patient: ""
            });
            setSubmitEvent(false);
        } else {
            setSubmitEvent(true);
        }
    };
    const handleOnClick = () => {
        setForm((oldForm) => ({
            ...oldForm,
            costs_used: {
                ...(oldForm?.costs_used ?? {}),
                "": 0
            }
        }))
    };
    const handleOnDeleteCost = (costKey) => {
        setForm((oldForm) => {
            const copyCostsUsed = JSON.parse(JSON.stringify(oldForm?.costs_used ?? {}));
            delete copyCostsUsed[costKey];
            return ({
                ...oldForm,
                costs_used: copyCostsUsed
            });
        });
    };
    return (
        <div className='full-width'>
            <div className='form-label'>
                <label htmlFor='details'>Details</label>
                <InputTextarea
                    id="details"
                    aria-describedby="details"
                    value={ form.details }
                    onChange={(e) => handleFormChange(e.target.value, "details")}
                />
            </div>
            <div className='form-label'>
                <label htmlFor='order_type'>Intervention type</label>
                <Dropdown
                    name="order_type"
                    aria-describedby="order_type"
                    value={form.order_type}
                    onChange={(e) => handleFormChange(e.value, "order_type")}
                    options={event_type}
                    optionValue="code"
                    optionLabel="name"
                    invalid={ submitEvent && !form?.order_type }
                    placeholder="Select intervention type"
                />
                {
                    submitEvent && !form?.order_type && (
                        <small id="order_type" style={{
                            color: "red"
                        }}>
                            Intervention type is mandatory
                        </small>
                    )
                }
            </div>
            <div className="form-label">
                <Panel header="Tools used" className="form-label">
                    {
                        Object.keys(form?.costs_used ?? {}).map((costKey) => (<div key={costKey} className="form-label">
                            <Dropdown
                                value={costKey}
                                onChange={(e) => handleFormChange(e.value, "costs_used", costKey)}
                                options={stockList}
                                optionValue="code"
                                optionLabel="name"
                                invalid={ submitEvent && !costKey }
                                placeholder="Select Tools"
                            />
                            <br />
                            <InputNumber
                                value={ form?.costs_used?.[costKey] ?? 0 }
                                onChange={(e) => handleFormChange(e.value, "costs_used", costKey)}
                                invalid={ submitEvent && !(form?.costs_used?.[costKey] ?? 0) }
                                min={1}
                                max={stocksData?.data?.data?.find((item) => item.id === costKey)?.quantity}
                            />
                            <br />
                            <Button label="Delete" onClick={ () => handleOnDeleteCost(costKey) } />
                        </div>))
                    }
                    {
                        submitEvent && (Object.keys(form?.costs_used ?? {})?.find((costKey) => !costKey)
                        || Object.values(form?.costs_used ?? {})?.find((costVal) => !costVal)
                        || Object.keys(form?.costs_used ?? {})?.length === 0) && (
                            <small id="date" style={{
                                color: "red"
                            }}>
                                All tools need to be completed
                            </small>
                        )
                    }
                    <Button label="Add Tool" onClick={ handleOnClick } />
                </Panel>
            </div>
            <div className='form-label'>
                <label htmlFor='total_price'>Total price</label>
                <InputNumber
                    id="total_price"
                    aria-describedby="total_price"
                    value={ form.total_price }
                    invalid={ submitEvent && !form?.total_price }
                    onChange={(e) => handleFormChange(e.value, "total_price")}
                />
                {
                    submitEvent && !form?.total_price && (
                        <small id="total_price" style={{
                            color: "red"
                        }}>
                            Price is mandatory
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
                <label htmlFor='date'>Date invoice</label>
                <Calendar
                    id="date"
                    value={ form.date }
                    onChange={(e) => handleFormChange(e.value, "date")}
                    dateFormat="yy-mm-dd"
                    invalid={ submitEvent && !form?.date }
                />
                {
                    submitEvent && !form?.date && (
                        <small id="date" style={{
                            color: "red"
                        }}>
                            Date invoice is mandatory
                        </small>
                    )
                }
            </div>
            <Button label={ labelSubmit ?? "Update" } className="my-10" onClick={() => handleSubmitEvent() } />
            <br />
            {
                cancel && (
                    <Button label="Cancel" onClick={() => handleCancelEvent() } />
                )
            }
        </div>
    )
}