import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import FullCalendar from "@fullcalendar/react";
import timeGridWeek from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; 
import { Toast } from 'primereact/toast';
import { useMutation, useQueryClient } from 'react-query';
import { event_type, getWeekNumber, useGetReservations } from '../utils/utils';
import CancelEvent from '../components/CancelEvent';
import AddEvent from '../components/AddEvent';
import { deleteData, saveData } from '../utils/requests';
import "../style/HomePatDoc.css";

export default function HomePatDoc() {
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    const calenderRef = useRef();
    // salvam in aceasta variabila daca dialogul de adaugare eveniment este visibil sau nu
    const [visibleDialog, setVisibleDialog] = useState(false);
    // salvam in aceasta variabila evenimentul selectat/slot-ul selectat din calendar
    const [selectEvent, setSelectEvent] = useState(undefined);
    // salvam in aceasta variabila daca dialogul de stergere a unui eveniment este vizibil sau nu 
    const [visibleUpdateDialog, setVisibleUpdateDialog] = useState(false);
    // salvam in aceasta variabila numarul saptamanii in care suntem
    const today = getWeekNumber();
    // salvam in aceasta variabila numarul saptamanii la care navigam
    const [prevNext, setPrevNext] = useState(getWeekNumber());
    // salvam in aceasta variabila o referinta catre componenta de afisare a notificarilor
    const toastRef = useRef(null);
    // folosim aceasta variabila pentru a dezactiva zilele din spate si a nu lasa userul sa seteze evenimente in trecut
    const daysOfWeekType = {
        "monday": [1, 2, 3, 4, 5],
        "tuesday": [2, 3, 4, 5],
        "wednesday": [3, 4, 5],
        "thursday": [4, 5],
        "friday": [5],
        "saturday": [],
        "sunday": []
    }
    // salvam in aceasta variabila ziele care sunt valabile (de ex: 'monday' are zilele [1, 2, 3, 4, 5])
    const [daysOfWeek, setDaysOfWeek] = useState(daysOfWeekType[
        new Date().toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'}) > "18:00" ? new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).toLocaleDateString("en", { weekday: "long" }).toLowerCase() : new Date().toLocaleDateString("en", { weekday: "long" }).toLowerCase()]);

    // functie pentru afisarea notificarilor
    const show = (severity, summary, detail) => {
        toastRef.current.show({ severity: severity, summary: summary, detail: detail });
    };
    const eventsList = useGetReservations(userDetails?.account, userDetails?.userid, userDetails?.doctorid);
    //folosim aceasta variabila pentru a invalida cheile din cache si a forta ca datele sa fie actualizate in functie de ce cheie dam
    const queryClient = useQueryClient();
    // aceasta variabila o folosim pentru a trimite request-urile catre backend si a le salva in baza de date
    const saveMutation = useMutation((data) => saveData(
        "/api/v1/posts/reservation",
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (response) => {
            // Daca totul a fost cu success afisam notificare si revalidam datele, adica fortam ca sa se apeleze query-ul cu cheia events iar
            show("success", 'Success', "Operation succeed");
            queryClient.invalidateQueries(`${userDetails?.userid}-events`);
        },
        onError: (error) => {
            show("error", "Error", error.error);
        }
    });
    const deleteMutation = useMutation((data) => deleteData(
        `/api/v1/delete/reservation/${data.id}`,
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (response) => {
            // Daca totul a fost cu success afisam notificare si revalidam datele, adica fortam ca sa se apeleze query-ul cu cheia events iar
            show("success", 'Success', "Operation succeed");
            queryClient.invalidateQueries(`${userDetails?.userid}-events`);
        },
        onError: (error) => {
            show("error", "Error", error.error);
        }
    });
    // functie care se apeleaza la selectarea unui slot gol din calendar
    const handleSelectEvent = (eventSelected) => {
        if (eventSelected) {
            setSelectEvent({
                title: "",
                startdate: eventSelected.startStr.split("+")[0],
                enddate: eventSelected.endStr.split("+")[0],
                createdby: userDetails?.userid,
                doctorid: userDetails?.account === "doctor" ? userDetails?.userid : userDetails?.doctorid
            });
            setVisibleDialog(true);
        }
    }

    // resetam variabilele
    const handleResetSelectEvent = () => {
        setSelectEvent(undefined);
        setVisibleDialog(false);
    }

    // evenimentul de submit, cand se apasa butonul de submit la formular
    const handleSubmitEvent = (data) => {
        
        let titleName = userDetails?.account === "patient" ? 
        `${event_type?.find(ev => ev.code === data.type)?.name} `
        : "";
        titleName += data.name + " ";
        if (userDetails?.account === "patient") {
            titleName += userDetails?.firstname + " " + userDetails?.lastname;   
        }

        if (selectEvent) {
            saveMutation.mutate({ name: titleName, type: userDetails?.account === "patient" ? data.type : "meeting", startdate: selectEvent.startdate, enddate: selectEvent.enddate, createdby: selectEvent.createdby, doctor: selectEvent.doctorid });
            handleResetSelectEvent();
        }
    }

    // functie care se apeleaza cand se da click pe un eveniment deja creat
    const handleEventClicked = (ev) => {
        if (userDetails?.account === "doctor" || userDetails?.account === "patient") {
            // eslint-disable-next-line eqeqeq
            const findEvent = eventsList?.data?.data?.filter(even => even.id == ev.event._def.publicId && even.createdby === userDetails?.userid && even?.startdate?.split("T")?.[0] >= new Date().toLocaleDateString("en-GB").split("/").reverse().join("-"))?.[0];
            if (findEvent) {
                setSelectEvent(findEvent);
                setVisibleUpdateDialog(true);
            }
        }
    }

    // functie pentru stergerea unui eveniment
    const handleRemoveEvent = () => {
        if (selectEvent && visibleUpdateDialog) {
            deleteMutation.mutate({ id: selectEvent.id });
            setSelectEvent(undefined);
            setVisibleUpdateDialog(false);
        }
    }

    // functie pentru inchiderea dialogului si resetarea variabilelor
    const onHideDialog = () => {
        setSelectEvent(undefined);
        setVisibleUpdateDialog(false);
    }
    // lasam sa fie selectabile sloturile din intervalul 7 dimineata si 18 dupa masa
    const handleSelectAllow = (selectInfo) => {
        if (selectInfo.start.toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'}) >= "07:00" && selectInfo.end.toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'}) <= "18:00") {
            return true;
        }
        return false;
    }
    return (
        <div className='HomePatDoc'>
            {/* Verificam daca userul este pacient sau doctor, in caz contrar afisam mesaj ca nu are drepturi */}
            {
                ((userDetails?.account === "patient") || (userDetails?.account === "doctor"))
                ?
                <>
                    {/* Componenta din primereact */}
                    <Toast ref={toastRef} />
                    {/* Componenta custom pentru adaugarea unui eveniment */}
                    <AddEvent
                        visibleDialog={visibleDialog}
                        setVisibleDialog={ setVisibleDialog }
                        onSubmit={ handleSubmitEvent }
                    />
                    {/* Componenta custom creata de mine pentru stergerea unui eveniment */}
                    <CancelEvent
                        visible={ visibleUpdateDialog }
                        onHide={ onHideDialog }
                        onSubmit={ handleRemoveEvent }
                    />
                    <div>
                        {/* Componenta din libraria fullcalendar */}
                        <FullCalendar
                            ref={calenderRef}
                            plugins={[ interactionPlugin, timeGridWeek ]}
                            // nu permitem sa se afiseze weekenduri
                            weekends={ false }
                            initialView='timeGridWeek'
                            // indicator pentru a stii ora la care suntem pe sloturi
                            nowIndicator={ true }
                            // facem componenta sa fie selectabila
                            selectable={ true }
                            // permitem sa fie selectate doar evenimentele pacientilor/ toate evenimentele de catre medic
                            selectOverlap={ (e) => e.rendering === "auto" }
                            selectAllow={ handleSelectAllow }
                            allDaySlot={ false }
                            // setam constrangerile de selectare pentru a nu lasa sa fie selectate evenimente trecute
                            selectConstraint={{
                                daysOfWeek: daysOfWeek,
                                startTime: "07:00",
                                endTime: "18:00",
                            }}
                            eventClick={ handleEventClicked }
                            select={ handleSelectEvent }
                            // setam constrangerile pentru a nu permite userilor sa seteze evenimente in trecut
                            businessHours={{
                                daysOfWeek: daysOfWeek,
                                startTime: "07:00",
                                endTime: "18:00",
                            }}
                            // afisam butoanele de deasupra calendarului
                            headerToolbar={{
                                left: 'customleft,customright,customtoday',
                                center: 'title',
                                right: 'timeGridWeek,timeGridDay' // user can switch between the two
                            }}
                            customButtons={{
                                // customizam butonul de prev
                                customleft: {
                                    icon: "bi bi-arrow-left",
                                    click: () => {
                                        const api = calenderRef.current.getApi();
                                        api.prev();
                                        if (today === prevNext - 1) {
                                            const dateNow = new Date();
                                            const todayTime = new Date().toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'});
                                            setDaysOfWeek(daysOfWeekType[todayTime > "18:00" ? new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1).toLocaleDateString("en", { weekday: "long" }).toLowerCase() : new Date().toLocaleDateString("en", { weekday: "long" }).toLowerCase()]);
                                        } else if (today < prevNext - 1) {
                                            setDaysOfWeek(daysOfWeekType["monday"]);
                                        } else {
                                            setDaysOfWeek(daysOfWeekType["saturday"]);
                                        }
                                        setPrevNext(prevNext - 1);
                                    }
                                },
                                // customizam butonul de next
                                customright: {
                                    icon: "bi bi-arrow-right",
                                    click: () => {
                                        const api = calenderRef.current.getApi()
                                        api.next();
                                        if (today === prevNext + 1) {
                                            const dateNow = new Date();
                                            const todayTime = new Date().toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'});
                                            setDaysOfWeek(daysOfWeekType[todayTime > "18:00" ? new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1).toLocaleDateString("en", { weekday: "long" }).toLowerCase() : new Date().toLocaleDateString("en", { weekday: "long" }).toLowerCase()]);
                                        } else if (today > prevNext + 1) {
                                            setDaysOfWeek(daysOfWeekType["saturday"]);
                                        } else {
                                            setDaysOfWeek(daysOfWeekType["monday"]);
                                        }
                                        setPrevNext(prevNext + 1);
                                    }
                                },
                                // customizam butonul de today
                                customtoday: {
                                    text: "today",
                                    click: () => {
                                        const api = calenderRef.current.getApi()
                                        api.today();
                                        const dateNow = new Date();
                                        const todayTime = new Date().toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'});
                                        setDaysOfWeek(daysOfWeekType[todayTime > "18:00" ? new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + 1).toLocaleDateString("en", { weekday: "long" }).toLowerCase() : new Date().toLocaleDateString("en", { weekday: "long" }).toLowerCase()]);
                                        setPrevNext(today);
                                    }
                                },
                            }}
                            // setam evenimentele
                            events={eventsList?.data?.data?.map((ev) => ({
                                id: ev.id,
                                title: userDetails?.account !== "doctor" && ev.createdby !== userDetails?.userid ? "" : ev?.name?.replace(userDetails?.firstname + " " + userDetails?.lastname, ""),
                                start: ev.startdate,
                                end: ev.enddate,
                                createdby: ev.createdby,
                                display: userDetails?.account !== "doctor" && ev.createdby !== userDetails?.userid ? "background" : "auto",
                                color: userDetails?.account !== "doctor" && ev.createdby !== userDetails?.userid ? '#4CAF50' : '#4CAF50'
                            })) ?? []}
                        />
                    </div>
                </>
                :
                <p>Nu aveti acces, va rugam sa contactati adminul</p>
            }

        </div>
    )
}