import React, { useRef, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from "primereact/button";
import { TOAST_LIFE, useGetDocuments, useGetFile } from "../utils/utils";
import { useSelector } from "react-redux";
import Dialog from "../components/Dialog";
import { AddDocumentForm } from "../components/DocumentForm";
import { useMutation, useQueryClient } from "react-query";
import { Toast } from "primereact/toast";
import { saveData, writeFileToServer } from "../utils/requests";
import "../style/Recipes.css";
import { Document, Page, pdfjs  } from "react-pdf";
import { InputText } from "primereact/inputtext";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function Recipes() {
    // in userDetails se afla datele despre user-ul conectat la aplicatie (folosim redux pentru salvarea datelor userului)
    const userDetails = useSelector(state => state.userDetails.data);
    // aducem lista de retete in functie de id-ul userului conectat
    const documentList = useGetDocuments("recipes", userDetails?.userid);
    const [openDialog, setOpenDialog] = useState(false);
    const queryClient = useQueryClient();
    // obtinem referinta la componenta Toast pentru a putea seta mesajele de notificare
    const toast = useRef(null);
    // salvam in aceasta variabila fisierul adus din baza de date ori de cate ori se expandeaza un rand din tabel
    const [pdfString, setPdfString] = useState(undefined);
    // salvam in aceasta variabila numarul total de pagini
    const [numPages, setNumPages] = useState(null);
    // salvam in aceasta variabila numarul paginii la care suntem
    const [pageNumber, setPageNumber] = useState(1);
    // salvam in aceasta variabila datele de pe un rand selectat, adica cand apasam pe butonul de expandare
    const [expandedRow, setExpandedRow] = useState(null);
    // stocam informatia de pe filtru din interfata pentru a o folosi mai jos
    const [filterVal, setFilterVal] = useState("");
    // hook pentru a scrie un fisier pdf pe server si in baza de date
    const documentMutation = useMutation((data) => writeFileToServer(data), {
        onSuccess: (response) => {
            queryClient.invalidateQueries(`${userDetails?.userid}-recipes-list`);
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // hook pentru a sterge un document pdf de pe server si din baza de date
    const deleteMutation = useMutation((data) => saveData(
        "/api/v1/posts/files/delete",
        {
            credentials: "include"
        },
        data
    ), {
        onSuccess: (response) => {
            if (expandedRow?.id === response?.[0]?.id) {
                setExpandedRow(null);
            }
            queryClient.invalidateQueries(`${userDetails?.userid}-recipes-list`);
            toast.current.show({severity:'success', summary: 'Success', detail:'Operation succeed', life: TOAST_LIFE});
        },
        onError: (result) => {
            toast.current.show({severity:'error', summary: 'Error', detail: result.error, life: TOAST_LIFE});
        }
    });
    // functie care se apeleaza cand se expandeaza o linie
    const onRowExpand = (dataRow) => {
        setExpandedRow(dataRow);
        setPageNumber(1);
        setNumPages(null);
        setPdfString(undefined);
    };
    // functie pentru setarea pdf-ului pentru linia selectata
    const onUploadFile = (file) => {
        setPdfString(file);
    };
    // functie pentru extragerea documentului pdf de pe server
    useGetFile(expandedRow?.name?.replace(".pdf", "") ?? undefined, onUploadFile);
    // functie care se apeleaza atunci cand se apasa pe butoanele de navigare de deasupra documentului pdf cand se incarca
    const handlePageNumber = (mode) => {
        if (mode === "prev") {
            setPageNumber(pageNumber - 1)
        } else {
            setPageNumber(pageNumber + 1);
        }
    };
    // aceasta functie se apeleaza cand s-a randat fisierul pdf in componenta Document pentru a extrage numarul de pagini total
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };
    // template de ce sa se afiseze cand se expandeaza o linie
    const rowExpansionTemplate = (dataRow) => {
        return (
            <div className="document-template">
                {
                    pdfString && expandedRow?.id === dataRow?.id &&
                    (    <div>
                            <div>
                                <Button label="Previous Page" className="mr-10" disabled={ pageNumber === 1 } onClick={() => handlePageNumber("prev")} />
                                <Button label="Next Page" disabled={ pageNumber === numPages } onClick={() => handlePageNumber("next")} />
                            </div>
                            <h2>PDF Document</h2>
                            <Document
                                file={`data:application/pdf;base64,${pdfString}`}
                                error="None pdf has been loaded"
                                onLoadSuccess={onDocumentLoadSuccess}
                            >
                                <Page pageNumber={ pageNumber } renderTextLayer={ false } renderAnnotationLayer={ false } />
                            </Document>
                            {numPages && <p className="text-center">Page {pageNumber} from {numPages}</p>}
                            <div>
                            {
                                expandedRow?.name && <a download={expandedRow?.name?.split("_recipes_")?.[0] ?? ""} href={`data:application/pdf;base64,${pdfString}`}>Download</a>
                            }
                            </div>
                        </div>
                    )
                }  
            </div>
        );
    };
    // functie pentru afisare dialogului
    const handleOnOpenDialog = () => {
        setOpenDialog(true);
    };
    // functie pentru inchiderea dialogului
    const handleOnCancel = () => {
        setOpenDialog(false);
    };
    // functie care apeleaza hook-ul pentru adaugarea unui fisier pdf
    const handleOnAddFile = (data) => {
        documentMutation.mutate({ id: data.patientid, file: data.documents, type: "recipes" });
        setOpenDialog(false);
    };
    // functie care apeleaza hook-ul pentru stergerea unui document
    const handleDeleteRecipe = (data) => {
        deleteMutation.mutate({ id: data.id, filename: data.name });
    };
    // functie pentru afisarea tipurilor de actiuni pentru fiecare linie
    const bodyActions = (dataRow) => {
        return (
            <Button label="Delete" onClick={ () => handleDeleteRecipe(dataRow) } />
        )
    };
    // functie pentru a afisa numele documentului pentru fiecare linie
    const bodyName = (dataRow) => {
        return dataRow?.name?.split("_recipes_")?.[0]?.replaceAll("_", " ");
    };
    // functie pentru a extrage informatia introdusa in campul text de filtru
    const handleOnChange = (value) => {
        setFilterVal(value);
    };
    // Filtrarea documentelor in functie de informatia din filtru
    const documentListFinal = (documentList?.data?.data ?? [])
    .filter(document => (document?.firstname?.toLowerCase().includes(filterVal?.toLowerCase())
                    || document?.lastname?.toLowerCase().includes(filterVal?.toLowerCase())
                    || (document?.firstname + " " + document?.lastname)?.toLowerCase().includes(filterVal?.toLowerCase())
                    || bodyName(document)?.toLowerCase().includes(filterVal?.toLowerCase())));
    return (
        <div className="Recipes">
            { userDetails?.account === "doctor" && (<Button label="Add Prescription" className='my-10' onClick={() => handleOnOpenDialog() } />) }
            <div className='my-10 filter-content'>
                <div className='form-label'>
                    <label htmlFor='filter'>Filter{userDetails?.account === "doctor" ? " by document name, patient name" : " by document name"}</label>
                    <InputText
                        id="filter"
                        aria-describedby="filter"
                        value={ filterVal }
                        onChange={(e) => handleOnChange(e.target.value)}
                    />
                </div>
            </div>
            <DataTable
                // folosim rows si paginator pentru a afisa partea de paginatii la tabel, daca depaseste 7 linii in tabel
                // apare paginatia
                rows={7}
                paginator={ documentListFinal?.length > 7 ? true : false }
                value={documentListFinal ?? []}
                expandedRows={ [expandedRow] }
                rowExpansionTemplate={ (dataRow) => rowExpansionTemplate(dataRow) }
                onRowExpand={ (event) => onRowExpand(event.data) }
                onRowCollapse={ () => setExpandedRow(null) }
            >
                <Column header="Expand" expander></Column>
                <Column field="name" header="Document Name" body={ bodyName } expander={ true }></Column>
                <Column field="firstname" header={`${userDetails?.account === "doctor" ? "Patient" : "Doctor"} Firstname`}></Column>
                <Column field="lastname" header={`${userDetails?.account === "doctor" ? "Patient" : "Doctor"} Lastname`}></Column>
                {
                    userDetails?.account === "doctor" && (<Column field="actions" header="Actions" body={ bodyActions }></Column>)
                }
            </DataTable>
            {
                userDetails?.account === "doctor" && (
                    <Dialog
                        header={() => <h3>Add a recipe</h3>}
                        visible={ openDialog }
                        onHide={ handleOnCancel }
                    >
                        <AddDocumentForm
                            data={ userDetails }
                            isPatient={ userDetails?.account === "patient" }
                            submit={ handleOnAddFile }
                            cancel={ handleOnCancel }
                        />
                    </Dialog>
                )
            }
            <Toast ref={toast} />
        </div>
    );
}