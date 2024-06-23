CREATE TABLE public.account (
    id uuid NOT NULL,
    type character varying(255) NOT NULL
);



CREATE TABLE public.doctors (
    id uuid NOT NULL,
    userid uuid NOT NULL,
    degreenumber character varying(255),
    degreeseries character varying(255),
    graduationdate timestamp with time zone,
    college character varying(255)
);



CREATE TABLE public.documents (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    doctor uuid NOT NULL,
    patient uuid
);



CREATE TABLE public.invitations (
    id uuid NOT NULL,
    old_doctor uuid NOT NULL,
    patient uuid NOT NULL,
    new_doctor uuid NOT NULL,
    status_old_doctor boolean,
    status_patient boolean,
    status_new_doctor boolean,
    details_old_doctor text,
    details_patient text,
    details_new_doctor text
);


--
-- TOC entry 207 (class 1259 OID 402086)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    details text NOT NULL,
    order_type character varying(255) NOT NULL,
    total_price double precision NOT NULL,
    costs_used jsonb NOT NULL,
    date timestamp with time zone NOT NULL,
    doctor uuid NOT NULL,
    patient uuid NOT NULL,
    doctor_name character varying(255)
);


--
-- TOC entry 203 (class 1259 OID 402044)
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid NOT NULL,
    userid uuid NOT NULL,
    affections text[] NOT NULL,
    treatments text[] NOT NULL,
    allergies text[] NOT NULL,
    interventions text[] NOT NULL,
    doctor uuid NOT NULL
);



--
-- TOC entry 204 (class 1259 OID 402050)
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id uuid NOT NULL,
    startdate timestamp with time zone NOT NULL,
    type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    createdby uuid NOT NULL,
    doctor uuid NOT NULL,
    enddate timestamp with time zone
);


--
-- TOC entry 206 (class 1259 OID 402080)
-- Name: stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    doctor_id uuid NOT NULL,
    quantity integer NOT NULL,
    is_reusable boolean DEFAULT false NOT NULL,
    price double precision NOT NULL,
    date_buyed timestamp with time zone NOT NULL
);



--
-- TOC entry 205 (class 1259 OID 402056)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    account uuid NOT NULL,
    status boolean,
    new_account boolean
);



--
-- TOC entry 3044 (class 0 OID 402029)
-- Dependencies: 200
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.account (id, type) VALUES ('747afe67-c381-49bb-b049-87d128b397f4', 'doctor');
INSERT INTO public.account (id, type) VALUES ('315be645-83db-49de-ae55-2f330317802b', 'admin');
INSERT INTO public.account (id, type) VALUES ('94d81f77-c95d-4426-b62f-50452e0b12ec', 'patient');


--
-- TOC entry 3045 (class 0 OID 402032)
-- Dependencies: 201
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.doctors (id, userid, degreenumber, degreeseries, graduationdate, college) VALUES ('7020a5b0-8923-4155-a409-0d696d6de605', '8ebce516-bf00-41e1-921d-0bba3a0fd804', 'ICL/002/XXX/01', '721123', '2006-08-23 00:00:00+03', 'Universitatea de Medicina si Farmacie Timisoara');
INSERT INTO public.doctors (id, userid, degreenumber, degreeseries, graduationdate, college) VALUES ('1eced7c2-5b04-47bc-a4ae-6040de10dcf7', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 'ICL/003/XXX/03', '721234', '2006-07-27 00:00:00+03', 'Universitatea de Medicina si Farmacie Timisoara');


--
-- TOC entry 3046 (class 0 OID 402038)
-- Dependencies: 202
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('931ce4cb-25d1-428c-9a9d-b42daf7f3773', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_08_00_16_09.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('f82ebebd-04cf-4937-8d61-b65738dad576', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_08_00_16_19.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('83eb16a2-5256-4633-aa06-bd42e5d6dee6', 'document_test_recipes_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_42_41.pdf', 'recipes', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('0fce5953-f048-4fbe-8fbd-e747a739218f', 'document_test_recipes_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_43_06.pdf', 'recipes', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('ffe0f574-657f-4372-b233-06ed795ce618', 'document_test_recipes_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_43_15.pdf', 'recipes', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('48efec40-1a24-4e86-bd36-59801ec10974', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_45_22.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('0697b425-179f-435d-ae36-90239758fd9c', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_46_21.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('48f0dad8-46a0-4d1f-85d7-2a360112097f', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_46_28.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('7f804e47-e691-4bc8-a6bf-ee4d6d00a2d2', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_46_35.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('78a62e69-6055-4dcb-99a9-0d6a87d606a8', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_47_09.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('b440523a-a9d1-4576-8f94-0a0832cb177a', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_47_17.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('4ab272d0-a4a2-4583-80d8-4f4f8f5a8cdc', 'document_test_certificates_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_47_24.pdf', 'certificates', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('67c01b6f-4670-49e6-b85f-a2a7fc7a0404', 'document_test_recipes_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_07_21_49_18.pdf', 'recipes', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');
INSERT INTO public.documents (id, name, category, doctor, patient) VALUES ('23e86e71-22f5-4a85-963c-e68ba2ad4c61', 'document_test_recipes_8a89e6b8-ce18-4e54-b51b-490fc5472b84_2024_05_08_00_16_30.pdf', 'recipes', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84');


--
-- TOC entry 3052 (class 0 OID 418483)
-- Dependencies: 208
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.invitations (id, old_doctor, patient, new_doctor, status_old_doctor, status_patient, status_new_doctor, details_old_doctor, details_patient, details_new_doctor) VALUES ('60c254fe-0833-42d7-83cb-867ecc93875d', '8ebce516-bf00-41e1-921d-0bba3a0fd804', '8a89e6b8-ce18-4e54-b51b-490fc5472b84', '80315f8e-8b1d-41a2-881d-a8230aaf31da', true, true, true, NULL, NULL, NULL);
INSERT INTO public.invitations (id, old_doctor, patient, new_doctor, status_old_doctor, status_patient, status_new_doctor, details_old_doctor, details_patient, details_new_doctor) VALUES ('1918fb5c-f635-4c62-a174-20ce084ee27b', '8ebce516-bf00-41e1-921d-0bba3a0fd804', '6c808c41-13d8-4364-a59f-e0d90b0a35e1', '80315f8e-8b1d-41a2-881d-a8230aaf31da', true, true, true, NULL, NULL, NULL);


--
-- TOC entry 3051 (class 0 OID 402086)
-- Dependencies: 207
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders (id, details, order_type, total_price, costs_used, date, doctor, patient, doctor_name) VALUES ('b82879bc-ab37-4271-a6bb-9c1da41a73d3', 'test', 'consultatie', 123, '{"f89bf1cd-6827-4ee9-acb6-c1bc049b2294": 1}', '2024-05-09 00:00:00+03', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84', 'Doctor Second');
INSERT INTO public.orders (id, details, order_type, total_price, costs_used, date, doctor, patient, doctor_name) VALUES ('0ada03b7-6ed6-448d-98b0-779b0b590259', 'test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test ', 'operatie', 800, '{"3ddf5aa5-eb11-4b9f-a17c-768abcb142cb": 1, "55b1042f-36a0-4a20-ae77-aa9cf6dc0872": 32, "6d612c96-33b5-4f8d-9725-35d05010a638": 3, "b418b5bd-4cb1-4670-a39d-f8fe3a1c8123": 3, "f89bf1cd-6827-4ee9-acb6-c1bc049b2294": 123}', '2024-05-16 00:00:00+03', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '8a89e6b8-ce18-4e54-b51b-490fc5472b84', 'Doctor Second');


--
-- TOC entry 3047 (class 0 OID 402044)
-- Dependencies: 203
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.patients (id, userid, affections, treatments, allergies, interventions, doctor) VALUES ('472180f2-bee4-493f-8737-f3a8c2a6387e', '3691be47-8fc2-47d0-bd21-ecc3b856a421', '{"Glanda tiroida"}', '{}', '{}', '{}', '80315f8e-8b1d-41a2-881d-a8230aaf31da');
INSERT INTO public.patients (id, userid, affections, treatments, allergies, interventions, doctor) VALUES ('afed5751-96b9-4080-8da3-e17acd8a98b4', '6c808c41-13d8-4364-a59f-e0d90b0a35e1', '{}', '{}', '{}', '{}', '80315f8e-8b1d-41a2-881d-a8230aaf31da');
INSERT INTO public.patients (id, userid, affections, treatments, allergies, interventions, doctor) VALUES ('74d4a563-b6c5-4c20-bcd3-8f142b90119a', '8a89e6b8-ce18-4e54-b51b-490fc5472b84', '{"Glanda tiroida"}', '{Amoxicilina,Algocalmin}', '{Paracetamol}', '{"Extractie Masea cu Hemoragie"}', '80315f8e-8b1d-41a2-881d-a8230aaf31da');


--
-- TOC entry 3048 (class 0 OID 402050)
-- Dependencies: 204
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.reservations (id, startdate, type, name, status, createdby, doctor, enddate) VALUES ('e796a961-ad3e-4dd9-93de-f1b9030ba7eb', '2024-05-09 09:00:00+03', 'investigatie', 'Investigation Inima Patient Second', 'true', '8a89e6b8-ce18-4e54-b51b-490fc5472b84', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '2024-05-09 11:30:00+03');
INSERT INTO public.reservations (id, startdate, type, name, status, createdby, doctor, enddate) VALUES ('381e65f1-0878-4a4f-8f5a-014ba831108b', '2024-05-13 09:00:00+03', 'meeting', 'Pauza de masa ', 'true', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '2024-05-13 11:00:00+03');
INSERT INTO public.reservations (id, startdate, type, name, status, createdby, doctor, enddate) VALUES ('85d70054-fd0f-4227-a04e-913061cb32e4', '2024-05-14 09:00:00+03', 'meeting', 'Investigatie Patient Second ', 'true', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '80315f8e-8b1d-41a2-881d-a8230aaf31da', '2024-05-14 12:00:00+03');


--
-- TOC entry 3050 (class 0 OID 402080)
-- Dependencies: 206
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('2b2ad770-ab20-4c09-a2eb-6c61008e3c3f', 'Rivanol', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 500, false, 100, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('818d6d4a-2e6f-454e-b8d9-b97d304e492f', 'Seringi', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 98, false, 5, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('0574e6a1-6b8c-4c62-b7c8-cc98c118e131', 'Pasta plomba', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 499, false, 100, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('423e9a7f-5c31-4941-96b9-73eeec11cc13', 'Ace 5 mm', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 95, false, 5, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('3ddf5aa5-eb11-4b9f-a17c-768abcb142cb', 'Bisturiu', 'CF', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 18, true, 50, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('6d612c96-33b5-4f8d-9725-35d05010a638', 'Ace 10 mm', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 95, false, 5, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('b418b5bd-4cb1-4670-a39d-f8fe3a1c8123', 'Manusi', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 493, false, 5, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('55b1042f-36a0-4a20-ae77-aa9cf6dc0872', 'Apa oxigenata', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 467, false, 100, '2024-05-17 00:00:00+03');
INSERT INTO public.stock (id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ('f89bf1cd-6827-4ee9-acb6-c1bc049b2294', 'Betadina', 'CV', '80315f8e-8b1d-41a2-881d-a8230aaf31da', 376, false, 100, '2024-05-17 00:00:00+03');


--
-- TOC entry 3049 (class 0 OID 402056)
-- Dependencies: 205
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, email, password, firstname, lastname, account, status, new_account) VALUES ('4afcfb0a-4a4c-4f90-850f-39d65101d921', 'admin_medro@gmail.com', '$2b$10$63/IeHtkQ.4B3fQAF9zXreB523xEX7Okpkzg5pAMHgySTqTfuS2GK', 'Admin', 'Medro', '315be645-83db-49de-ae55-2f330317802b', true, false);
INSERT INTO public.users (id, email, password, firstname, lastname, account, status, new_account) VALUES ('3691be47-8fc2-47d0-bd21-ecc3b856a421', 'patient_third@gmail.com', '$2b$10$WRUPA8N3Gdc1rUtFy2Rsh.bjaT.cZu1cs.HdaJ/IlDcSU6aKCuweK', 'Patient', 'Third', '94d81f77-c95d-4426-b62f-50452e0b12ec', true, false);
INSERT INTO public.users (id, email, password, firstname, lastname, account, status, new_account) VALUES ('80315f8e-8b1d-41a2-881d-a8230aaf31da', 'doctor_second@gmail.com', '$2b$10$vYTBD0Raqa130Pw0oHk3N.u1F/Mq0ixs8Nzfj6B6l0iuseLUmGGHW', 'Doctor', 'Second', '747afe67-c381-49bb-b049-87d128b397f4', true, false);
INSERT INTO public.users (id, email, password, firstname, lastname, account, status, new_account) VALUES ('6c808c41-13d8-4364-a59f-e0d90b0a35e1', 'patient_first@gmail.com', '$2b$10$am0uNxRu6.b1V6gmTp9JuuitSjdawzyw4DAvwDLD9hvAJyNIpWdPu', 'Patient', 'First', '94d81f77-c95d-4426-b62f-50452e0b12ec', true, false);
INSERT INTO public.users (id, email, password, firstname, lastname, account, status, new_account) VALUES ('8a89e6b8-ce18-4e54-b51b-490fc5472b84', 'patient_second@gmail.com', '$2b$10$ptkBBF4tInGH0a0dUaKrmuSFC4lCgLncb.9uH7kvMe46oAgd1W0Mi', 'Patient', 'Second', '94d81f77-c95d-4426-b62f-50452e0b12ec', true, false);
INSERT INTO public.users (id, email, password, firstname, lastname, account, status, new_account) VALUES ('8ebce516-bf00-41e1-921d-0bba3a0fd804', 'doctor_first@gmail.com', '$2b$10$hf6Prx9YzfwPI4MuD4FtkODFMsdMxpviXmAdTQsVUz7F0dFzKu18m', 'Doctor', 'First', '747afe67-c381-49bb-b049-87d128b397f4', true, false);


--
-- TOC entry 2889 (class 2606 OID 402063)
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- TOC entry 2891 (class 2606 OID 402065)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- TOC entry 2893 (class 2606 OID 402095)
-- Name: doctors doctors_userid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_userid_key UNIQUE (userid);


--
-- TOC entry 2895 (class 2606 OID 402067)
-- Name: documents documents_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_name_key UNIQUE (name);


--
-- TOC entry 2897 (class 2606 OID 402069)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 2913 (class 2606 OID 418490)
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- TOC entry 2911 (class 2606 OID 402093)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 2899 (class 2606 OID 402071)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- TOC entry 2901 (class 2606 OID 426724)
-- Name: reservations reservations_datetime_doctor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_datetime_doctor_key UNIQUE (startdate, doctor);


--
-- TOC entry 2903 (class 2606 OID 402075)
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 2909 (class 2606 OID 402085)
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- TOC entry 2905 (class 2606 OID 402077)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 2907 (class 2606 OID 402079)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


-- Completed on 2024-05-14 00:38:37

--
-- PostgreSQL database dump complete
--

