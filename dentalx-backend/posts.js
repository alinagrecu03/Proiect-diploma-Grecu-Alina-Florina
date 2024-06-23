const { postRoutes, pool, bcrypt, upload, path, fs, uuidv4, SESS_LIFETIME } = require('./configuration');
const { costResponse } = require('./utils');

// endpoint pentru a sterge un fisier pdf din baza de date si de pe server
postRoutes.post('/files/delete', (req, res) => {
    new Promise(function(resolve, reject) {
      if (
        (req?.session?.user?.account === "patient"
      || req?.session?.user?.account === "doctor")
      && !!req?.session?.user?.status
      ) {
        // cautam in folder-ul public/pdfs dupa numele fisierului pdf venit din request si daca gasim il stergem din folder
        fs.unlinkSync(path.resolve(__dirname, `./public/pdfs/${req.body.filename}`))
        if (req.body.id) {
          // daca stergerea de pe server s-a facut cu succes il stergem si din baza de date
          pool.query("DELETE FROM documents WHERE id=$1 RETURNING *", [req.body.id], (error, results) => {
            if (error) {
              reject(error)
            }
            resolve(results.rows);
          })
        } else {
          reject('File not deleted');
        }
      } else {
        reject("DONT_HAVE_PERMISSIONS");
      }
    })
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error));
});

// endpoint pentru a face upload la un fisier in baza de date si pe server
// cand se realizeaza acest request, se apeleaza mai intai functia single din multer, care va apela functia filename din multer.diskStorage (vezi fisierul configuration.js)
// si care seteaza numele fisierului pdf care va fi stocat pe server in folderul public\pdfs
// dupa ce numele fisierul este setat se apeleza functia callback(null, fileName); si pe urma functia de jos care introduce noul nume al fisierului
// in baza de date in tabela documents
postRoutes.post('/files/upload/:patientId/:type', upload.single("file"), (req, res) => {
    new Promise(function(resolve, reject) {
      if ((req?.session?.user?.account === "patient"
      || req?.session?.user?.account === "doctor")
      && !!req?.session?.user?.status) {
        const id = uuidv4();
        pool.query("INSERT INTO documents(id, name, category, doctor, patient) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [id, req.file.filename, req.params.type, req?.session?.user?.account === "patient" ? req?.session?.user?.doctorid : req?.session?.user?.userid, req.params.patientId]
        , (error, results) => {
          if (error) {
            reject(error);
          }
          // if (req?.file) {
          //   req.file.id = id;
          // }
          resolve(results.rows);
        })
      } else {
        reject("DONT_HAVE_PERMISSIONS");
      }
  })
  .then(response => res.status(200).send(response))
  .catch(error => res.status(500).send(error));
});

postRoutes.post("/register", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    const {
      firstname,
      lastname,
      password,
      email,
      account,
      accountType
    } = req?.body ?? {};
    
    try {
      if (!email || !firstname || !lastname || !password || !account || !accountType) {
        throw Error("Invalid parameters");
      } 
  
      try {
        const findAccountType = await pool.query(`SELECT * FROM account WHERE account.id=$1`, [account]);
        if (findAccountType?.rows?.[0].type === "patient" || accountType === "patient") {
          throw Error("Wrong account id");
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
    
          const id = uuidv4();
          
          const result = await pool.query(`INSERT INTO users (id, email, password, firstname, lastname, account, status, new_account) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING email`,
          [id, email, hashedPassword, firstname, lastname, account, true, accountType === "admin" ? false : true]);
          if (result?.rows?.length > 0) {
            if (accountType === "doctor") {
              const idDoctor = uuidv4();
              const resultAddDoctor = await pool.query(`INSERT INTO doctors (id, userid) VALUES ($1, $2) RETURNING *`,
              [idDoctor, id]);
              return res.status(201).json({ data: resultAddDoctor?.rows?.[0] });
            }
            return res.status(201).json({ data: result?.rows?.[0] });
          } else {
            throw Error("Operation not succeed");
          }
        }
      } catch(err) {
        return res.status(409).json({error: "Email already exist in database"});
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

postRoutes.post("/login", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    const {
      email,
      password
    } = req?.body ?? {};
    if (!email || !password) {
      throw Error("Invalid parameters");
    }
    try {
      const result = await pool.query("SELECT users.id as userId, users.email as email, firstname, lastname, users.password as password, account.type as account, status, new_account FROM users INNER JOIN account ON account.id = users.account WHERE email = $1", [email]);
      let match; 

      if (result?.rows?.length === 0) {
        return res.status(400).send({error: "Email incorrect!"});
      } else if (result?.rows?.length > 0) {
        match = await bcrypt.compare(password, result?.rows?.[0]?.password);
      }
  
      if (!match) {
          return res.status(400).json({error: "Password incorrect!"});
      } else {
        let query = "SELECT " +
            "users.id as userId, email, firstname, lastname, account.type as account, status, new_account, " +
            "patients.id as patientId, patients.affections as affections, patients.treatments as treatments, patients.allergies as allergies, " +
            "patients.interventions as interventions, patients.doctor as doctorId, " +
            "(SELECT users.firstname as doctorFirstname FROM users WHERE users.id = patients.doctor), " +
            "(SELECT users.lastname as doctorLastname FROM users WHERE users.id = patients.doctor), " +
            "(SELECT users.email as doctorEmail FROM users WHERE users.id = patients.doctor) " +
          "FROM public.users " +
          "INNER JOIN account ON account.id = users.account " +
          `INNER JOIN patients ON patients.userid = users.id WHERE users.id = $1`;
        if (result?.rows?.[0]?.account === "doctor") {
          query = "SELECT " +
              "users.id as userId, users.email as email, users.firstname as firstname, users.lastname as lastname, account.type as account, users.status as status, users.new_account as new_account, " +
              "doctors.id as doctorId, doctors.degreenumber as degreenumber, doctors.degreeseries as degreeseries, " +
              "doctors.graduationdate as graduationdate, doctors.college as college " +
            "FROM users " +
            "INNER JOIN account ON account.id = users.account " +
            `INNER JOIN doctors ON doctors.userid = users.id WHERE users.id = $1`;
        } else if (result?.rows?.[0]?.account === "admin") {
          query = "SELECT "+
              "users.id as userId, email, firstname, lastname, account.type as account, status, new_account" +
              " FROM public.users " +
              `INNER JOIN account ON account.id = users.account WHERE users.id = $1`;
        }
        const getUserData = await pool.query(query, [result?.rows?.[0]?.userid]);
        req.session.user = getUserData?.rows?.[0] ?? {
          userid: result?.rows?.[0]?.userid,
          account: result?.rows?.[0]?.account,
          email: result?.rows?.[0]?.email,
          firstname: result?.rows?.[0]?.firstname,
          lastname: result?.rows?.[0]?.lastname,
          status: result?.rows?.[0]?.status,
          new_account: result?.rows?.[0]?.new_account
        };
        res.cookie("sid", req.session.id, {
          expires: new Date(Date.now() + SESS_LIFETIME),
          httpOnly: true,
        });
        return res.status(200).json({ data: getUserData?.rows?.[0] ?? {
          userid: result?.rows?.[0]?.userid,
          account: result?.rows?.[0]?.account,
          email: result?.rows?.[0]?.email,
          firstname: result?.rows?.[0]?.firstname,
          lastname: result?.rows?.[0]?.lastname,
          status: result?.rows?.[0]?.status,
          new_account: result?.rows?.[0]?.new_account
        } });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

//adaugarea unui pacient in sistem
postRoutes.post("/patient", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
    const {
      firstname,
      lastname,
      password,
      email,
      account,
      affections,
      treatments,
      allergies,
      interventions,
      doctor
    } = req?.body ?? {};
  
    try {
      // verificam daca contul autentificat are drepturi si este activ
      if ((req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "admin")
        && !!req?.session?.user?.status
      ) {
        // verificam variabilele din request daca sunt goale
        if (!email || !firstname || !lastname || !password || !account || !doctor) {
          throw Error("Invalid parameters");
        }
        // generam un uuid pentru pacient
        const userid = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        // cream userul in baza de date
        const resultUser = await pool.query(`INSERT INTO users (id, email, password, firstname, lastname, account, status, new_account) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING email`,
        [userid, email, hashedPassword, firstname, lastname, account, true, false]);
        // daca id-ul venit din request este un doctor valid cream un pacient nou in baza de date in tabela patients
        const isDoctor = await pool.query("SELECT users.id as userId, account.id as accountId FROM users INNER JOIN account ON account.id = users.account WHERE users.id=$1 AND account.type='doctor'", [doctor]);
        if (resultUser?.rowCount > 0 && isDoctor?.rowCount > 0) {
          const id = uuidv4();
          const result = await pool.query("INSERT INTO patients (id, userid, affections, treatments, allergies, interventions, doctor)" +
              " VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING userid, affections, treatments, allergies, interventions, doctor", [id, userid, affections, treatments, allergies, interventions, doctor]);
          try {
            // daca query-ul este cu succes afisam raspunsul
            return res.status(201).json({ data: result?.rows?.[0] });
          } catch(err) {
            // daca pacientul deja exista afisam mesaj
            return res.status(409).json({error: "Patient already exist in database"});
          }
        } else if (isDoctor?.rowCount === 0) {
          // daca id-ul pentru doctor nu este valid afisam eroare
          throw Error("Provide a valid patient and doctor account");
        }
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
      return res.status(500).json({ error: err });
    }
});

postRoutes.post("/stock", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    const {
      name,
      category,
      quantity,
      is_reusable,
      price,
      date_buyed
    } = req?.body ?? {};
    const categoryCheck = category === "CF" || category === "CV";
    const doctorId = req?.session?.user?.userid;
    try {
      if (req?.session?.user?.account === "doctor" && !!doctorId && !!req?.session?.user?.status) {
        if (!name || !category || !categoryCheck
          || !quantity || is_reusable === undefined || price === undefined
          || !date_buyed) {
          throw Error("Invalid parameters");
        }
        const id = uuidv4();
        const result = await pool.query("INSERT INTO stock(id, name, category, doctor_id, quantity, is_reusable, price, date_buyed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [id, name, category, doctorId, quantity, is_reusable, price, date_buyed]);
        return res.status(201).json({ data: result?.rows?.[0] });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

// endpoint pentru crearea unei comenzi
postRoutes.post("/order", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
    const {
      details,
      order_type,
      total_price,
      costs_used,
      date,
      doctor,
      patient
    } = req?.body ?? {};
    const costsUsedCheck = Object?.keys(costs_used)?.length > 0;
    const orderTypeCheck = order_type === "consultatie" || order_type === "control" || order_type === "investigatie" || order_type === "operatie";
    try {
      // verificam daca contul autentificat are drepturi si este activ
      if (req?.session?.user?.account === "doctor" && !!req?.session?.user?.status) {
        // verificam variabilele din request daca sunt goale
        if (!costs_used || !costsUsedCheck || !patient
          || !order_type || !orderTypeCheck || !doctor || total_price === undefined
          || !date) {
          throw Error("Invalid parameters");
        }
        // generam un nou uuid si inseram comanda in baza de date
        const id = uuidv4();
        const result = await pool.query("INSERT INTO orders(id, details, order_type, total_price, costs_used, date, doctor, patient, doctor_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [id, details, order_type, total_price, costs_used, date, doctor, patient, `${req?.session?.user?.firstname + " " + req?.session?.user.lastname}`]);
        if (result?.rows?.[0]) {
          // daca comanda s-a inserat in baza de date luam fiecare produs din stocul de marfa folosit la comanda
          // si reducem cantitatea din stocul de marfa la fiecare produs, din tabela stock,
          // daca toate reducerile de cantitate s-au efectuat cu succes in baza de date pe tabela stock afisam raspunsul
          const promiseArray = Object.keys(result?.rows?.[0]?.costs_used)?.map((costKey) => costResponse(costKey, result?.rows?.[0]));
          await Promise.all(promiseArray).then((responsePromise) => {
            return res.status(200).json({ data: responsePromise });
          }).catch((error) => {
            // daca ceva a esuat afisam eroarea
            return res.status(400).json({ data: error });
          });
          
        } else {
          // daca comanda nu s-a inserat afisam eroare
          return res.status(400).json({ data: result?.rows?.[0] });
        }
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
      return res.status(500).json({ error: err });
    }
});

//adaugarea unui doctor in sistem
postRoutes.post("/doctor", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    const {
      userid,
      degreenumber,
      degreeseries,
      graduationdate,
      college
    } = req?.body ?? {};
  
    try {
      if (
        (req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "admin")
        && !!req?.session?.user?.status
      ) {
        if (!userid || !degreenumber || !degreeseries || !graduationdate || !college) {
          throw Error("Invalid parameters");
        }
        const isDoctor = await pool.query("SELECT users.id as userId, account.id as accountId FROM users INNER JOIN account ON account.id = users.account WHERE users.id=$1 AND account.type='doctor'", [userid]);
        if (isDoctor?.rowCount > 0) {
          const id = uuidv4();
          const result = await pool.query("INSERT INTO doctors (id, userid, degreenumber, degreeseries, graduationdate, college)" +
          " VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [id, userid, degreenumber, degreeseries, graduationdate, college]);
          try {
            return res.status(201).json({ data: result?.rows?.[0] });
          } catch(err) {
            return res.status(409).json({ error: "Doctor already exist in database" });
          }
        } else {
          throw Error("Provide a valid user account");
        }
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

// crearea unei rezervari
postRoutes.post("/reservation", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    const {
      startdate,
      enddate,
      type,
      name,
      createdby,
      doctor
    } = req?.body ?? {};
  
    try {
      if (
        (req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "patient"
        || req?.session?.user?.account === "admin")
        && !!req?.session?.user?.status
      ) {
        if (!startdate || !enddate || !type || !name || !createdby || !doctor) {
          throw Error("Invalid parameters");
        }
          const id = uuidv4();
          const result = await pool.query("INSERT INTO reservations (id, startdate, enddate, type, name, status, createdby, doctor)" +
                " VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [id, startdate, enddate, type, name, true, createdby, doctor]);
          try {
            return res.status(201).json({ data: result?.rows?.[0] });
          } catch(err) {
            return res.status(409).json({ error: "A resevation already exist for the choosen doctor!" });
          }
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

// endpoint pentru crearea unei invitatii
postRoutes.post("/invitation", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
   // verificam variabilele din request
    const {
      old_doctor,
      patient,
      new_doctor
    } = req?.body ?? {};
    try {
      // verificam daca userul are drepturi si contul este activ
      if (req?.session?.user?.account === "admin" && !!req?.session?.user?.status) {
        // verificam variabilele din request
        if (!old_doctor || !patient || !new_doctor) {
          throw Error("Invalid parameters");
        }
        // verificam daca id-urile din request exista in baza de date
        const findOldDoctor = await pool.query("SELECT * FROM users WHERE users.id=$1", [old_doctor]);
        const findPatient = await pool.query("SELECT * FROM users WHERE users.id=$1", [patient]);
        const findNewDoctor = await pool.query("SELECT * FROM users WHERE users.id=$1", [new_doctor]);
        if (findOldDoctor?.rowCount > 0 && findPatient?.rowCount > 0 && findNewDoctor?.rowCount > 0) {
          // daca userii exista generam un uuid nou si introducem in baza de date noua invitatie
          const id = uuidv4();
          const result = await pool.query("INSERT INTO invitations(id, old_doctor, patient, new_doctor) VALUES ($1, $2, $3, $4) RETURNING *",
          [id, old_doctor, patient, new_doctor]);
          // daca query-ul s-a facut cu succes afisam raspunsul
          return res.status(201).json({ data: result?.rows?.[0] });
        } else {
          // afisam mesaj de eroare daca userii nu exista
          return res.status(400).json({ error: "Provide a valid id's" });
        }
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
      return res.status(500).json({ error: err });
    }
});

module.exports = postRoutes;