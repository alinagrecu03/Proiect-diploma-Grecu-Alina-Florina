const { getRoutes, fs, pool } = require('./configuration');

// endpoint prin care se extrage un fisier pdf de pe server din folderul public/pdfs
getRoutes.get('/files/:file', (req, res) => {
    if (!!req?.session?.user?.status
      && (req?.session?.user?.account === "patient"
      || req?.session?.user?.account === "doctor"
    )) {
      // cautam fisierul pdf in folderul public/pdfs si-l trimitem in response
      var file = fs.createReadStream(`./public/pdfs/${req.params.file}.pdf`);
      fs.stat(`public/pdfs/${req.params.file}.pdf`, function(err, data) {
        if (err) {
          return res.status(400).json({ error: "FILE_DOESNT_EXIST" });
        } else {
          res.setHeader('Content-Length', data.size);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${req.params.file}.pdf`);
          // daca fisierul s-a setat in response inchidem pipe-ul de cautare dupa fisiere
          file.pipe(res);
        }
      });
      // in cazul in care deschiderea stream-ului de citire este cu eroare trimitem eroarea in response
      file.on('error', function(err) {
        res.end(err);
      });
    } else {
      return res.status(403).send("DONT_HAVE_PERMISSIONS");
    }
});

getRoutes.get("/patients/:doctorId", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!!req?.session?.user?.status && req?.session?.user?.account === "doctor") {
      const result = await pool.query("SELECT " +
        "users.id as userId, email, firstname, lastname, account.type as account, status, " +
        "patients.id as patientId, patients.affections as affections, patients.treatments as treatments, patients.allergies as allergies, " +
        "patients.interventions as interventions, patients.doctor as doctor, " +
        "(SELECT users.firstname as doctorFirstname FROM users WHERE users.id = patients.doctor), " +
        "(SELECT users.lastname as doctorLastname FROM users WHERE users.id = patients.doctor), " +
        "(SELECT users.email as doctorEmail FROM users WHERE users.id = patients.doctor) " +
      "FROM public.users " +
      "INNER JOIN account ON account.id = users.account " +
      `INNER JOIN patients ON patients.userid = users.id WHERE patients.doctor = $1`, [req.params.doctorId]);
      return res.status(200).json({ data: result.rows });
    } else {
      return res.status(403).send({ error: "DONT_HAVE_PERMISSIONS" });
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

getRoutes.get("/patients", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    try {
      if (!!req?.session?.user?.status && req?.session?.user?.account === "admin") {
        const result = await pool.query("SELECT " +
        "users.id as userId, email, firstname, lastname, account.type as account, status, " +
        "patients.id as patientId, patients.doctor as doctor, " +
        "(SELECT users.firstname as doctorFirstname FROM users WHERE users.id = patients.doctor), " +
        "(SELECT users.lastname as doctorLastname FROM users WHERE users.id = patients.doctor), " +
        "(SELECT users.email as doctorEmail FROM users WHERE users.id = patients.doctor) " +
      "FROM public.users " +
      "INNER JOIN account ON account.id = users.account " +
      "INNER JOIN patients ON patients.userid = users.id");
        return res.status(200).json({ data: result.rows });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

getRoutes.get("/users", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    try {
      if (!!req?.session?.user?.status && req?.session?.user?.account === "admin") {
        const result = await pool.query("SELECT " +
        "users.id as userId, account.type as account, status, " +
        "concat_ws(' ', users.firstname, users.lastname) AS user_name " +
      "FROM users " +
      "INNER JOIN account ON account.id = users.account WHERE status=true");
        return res.status(200).json({ data: result.rows });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

getRoutes.get("/doctors", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      if (!!req?.session?.user?.status && req?.session?.user?.account === "admin") {
        const result = await pool.query("SELECT " +
        "users.id as userId, users.email as email, users.firstname as firstname, users.lastname as lastname, account.type as account, users.status as status, " +
        "doctors.id as doctorId, doctors.degreenumber as degreenumber, doctors.degreeseries as degreeseries, " +
        "doctors.graduationdate as graduationdate, doctors.college as college " +
      "FROM users " +
      "INNER JOIN account ON account.id = users.account " +
      "INNER JOIN doctors ON doctors.userid = users.id");
        return res.status(200).json({ data: result.rows });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

getRoutes.get("/documents/:category", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!!req?.session?.user?.status
      && (
        req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "patient"
      )) {
        let query = "";
        if (req?.session?.user?.account === "doctor") {
          query = "SELECT documents.id as id, documents.name as name, documents.category as category, documents.doctor as doctor, documents.patient as patient, "
          + "users.firstname as firstname, users.lastname as lastname "
          + `FROM documents INNER JOIN users ON users.id=documents.patient WHERE doctor=$1 AND category=$2`
        } else {
          query = "SELECT documents.id as id, documents.name as name, documents.category as category, documents.doctor as doctor, documents.patient as patient, "
          + "users.firstname as firstname, users.lastname as lastname "
          + `FROM documents INNER JOIN users ON users.id=documents.doctor WHERE patient=$1 AND category=$2`
        }
      const result = await pool.query(query, [req?.session?.user?.userid, req.params.category]);
      return res.status(200).json({ data: result.rows });
    } else {
      return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

getRoutes.get("/account", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
      const result = await pool.query("SELECT * FROM account");
      return res.status(200).json({ data: result.rows });
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

getRoutes.get("/reservations", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      if (!!req?.session?.user?.status
        && (req?.session?.user?.account === "patient"
        || req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "admin"
      )) {
        let query = "SELECT * from reservations WHERE";
        let parameters = [];
        
        if (Object.values((req.query))?.length > 0) {
          Object.values((req.query)).map((element) => {
            parameters.push(element);
          })
      
          let queryVariable = Object.keys((req.query))
          queryVariable.map((element, index) => {
            const startDate = element === "startDate";
            const endDate = element === "endDate";
            const variable = startDate ? "DATE(startdate)" : endDate ? "DATE(enddate)": element;
            query += ` ${variable} ${startDate ? ">" : endDate ? "<" : ""}= $${index + 1}`
            if (index !== queryVariable.length - 1) {
              query += " AND "
            }
          })
        } else {
          if (req?.session?.user?.account === "admin") {
            query = "SELECT reservations.id as id, reservations.startdate as startdate, reservations.type as type, "
            + "reservations.name as name, reservations.status as status, reservations.enddate as enddate, "
            + "(SELECT users.email as createdby FROM users WHERE users.id = reservations.createdby), "
            + "(SELECT users.email as doctor FROM users WHERE users.id = reservations.doctor) from reservations";
          } else {
            query = "SELECT * from reservations";
          }
        }
    
        const result = await pool.query(query, parameters);
    
        return res.status(200).json({ data: result.rows });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

getRoutes.get("/stock", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!!req?.session?.user?.status
      && (req?.session?.user?.account === "doctor"
      || req?.session?.user?.account === "admin"
    || req?.session?.user?.account === "patient")) {
      const {
        doctorId,
        date
      } = req?.query ?? {};
      const valuePool = [doctorId];
      let queryPool = "SELECT * FROM stock WHERE doctor_id=$1";
      if (date) {
        valuePool.push(date);
        queryPool += " AND date_buyed=$2"
      }
      const result = await pool.query(queryPool, valuePool);
      return res.status(200).json({ data: result?.rows });
    } else {
      return res.status(403).send({ error: "DONT_HAVE_PERMISSIONS" });
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

getRoutes.get("/order", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!!req?.session?.user?.status
      && (req?.session?.user?.account === "doctor"
    || req?.session?.user?.account === "patient"
    || req?.session?.user?.account === "admin")) {
      const {
        doctor,
        patient,
        date
      } = req?.query ?? {};
      const isDoctor = req?.session?.user?.account === "doctor";
      const isPatient = req?.session?.user?.account === "patient";
      const valuePool = isDoctor ? [doctor] : isPatient ? [patient] : [];
      let queryPool = "SELECT orders.id as id, orders.details as details, orders.order_type as order_type, orders.total_price as total_price, "
      + "orders.costs_used as costs_used, orders.date as date, orders.doctor as doctor, orders.patient as patient, "
      + "(SELECT concat_ws(' ', users.firstname, users.lastname) AS doctor_name FROM users WHERE users.id=orders.doctor), "
      + "(SELECT concat_ws(' ', users.firstname, users.lastname) AS patient_name FROM users WHERE users.id=orders.patient) "
      + `FROM orders ${!isPatient && !isDoctor ? "" : `WHERE ${isDoctor ? "doctor" : "patient"}=$1`}`;
      if (date) {
        valuePool.push(date);
        queryPool += `${!isDoctor && !isPatient ? " WHERE" : " AND"} date=$${!isDoctor && !isPatient ? "1" : "2"}`;
      }
      const result = await pool.query(queryPool, valuePool);
      return res.status(200).json({ data: result?.rows });
    } else {
      return res.status(403).send({ error: "DONT_HAVE_PERMISSIONS" });
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

getRoutes.get("/invitations", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!!req?.session?.user?.status
      && (req?.session?.user?.account === "patient"
      || req?.session?.user?.account === "doctor"
      || req?.session?.user?.account === "admin"
    )) {
      let query = "SELECT invitations.id as id, invitations.old_doctor as old_doctor, invitations.patient as patient, invitations.new_doctor as new_doctor, "
      + "invitations.status_old_doctor as status_old_doctor, invitations.status_patient as status_patient, invitations.status_new_doctor as status_new_doctor, "
      + "invitations.details_old_doctor as details_old_doctor, invitations.details_patient as details_patient, invitations.details_new_doctor as details_new_doctor, "
      + "(SELECT concat_ws(' ', users.firstname, users.lastname) AS old_doctor_name FROM users WHERE users.id=invitations.old_doctor), "
      + "(SELECT concat_ws(' ', users.firstname, users.lastname) AS patient_name FROM users WHERE users.id=invitations.patient), "
      + "(SELECT concat_ws(' ', users.firstname, users.lastname) AS new_doctor_name FROM users WHERE users.id=invitations.new_doctor) "
      + "FROM invitations";
      let parameters = [];
      
      if (Object.values((req.query))?.length > 0) {
        query += " WHERE ";
        Object.values((req.query)).map((element) => {
          parameters.push(element);
        })
    
        let queryVariable = Object.keys((req.query));
        queryVariable.map((element, index) => {
          const oldDoctor = element === "oldDoctor";
          const newDoctor = element === "newDoctor";
          const patient = element === "patient";
          if (oldDoctor) {
            query += `old_doctor=$${index + 1}`;
          }
          if (newDoctor) {
            query += `new_doctor=$${index + 1}`;
          }
          if (patient) {
            query += `patient=$${index + 1}`;
          }
          if (index !== queryVariable.length - 1) {
            query += " AND ";
          }
        })
      } else {
        if (req?.session?.user?.account !== "admin") {
          query = "";
        }
      }
  
      const result = await pool.query(query, parameters);
  
      return res.status(200).json({ data: result.rows });
    } else {
      return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

getRoutes.get("/number-invitations", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!!req?.session?.user?.status
      && (req?.session?.user?.account === "patient"
      || req?.session?.user?.account === "doctor"
    )) {
      let query = "SELECT count(*) as number_invitations FROM invitations";
      let parameters = [];
      
      if (Object.values((req.query))?.length > 0) {
        query += " WHERE ";
        Object.values((req.query)).map((element) => {
          parameters.push(element);
        });
    
        let queryVariable = Object.keys((req.query));
        queryVariable.map((element, index) => {
          const doctor = element === "doctor";
          const patient = element === "patient";
          if (doctor) {
            query += `(new_doctor=$${index + 1} AND status_new_doctor IS NULL) OR (old_doctor=$${index + 1} AND status_old_doctor IS NULL)`;
          }
          if (patient) {
            query += `(patient=$${index + 1} AND status_patient IS NULL)`;
          }
          if (index !== queryVariable.length - 1) {
            query += " OR ";
          }
        });
      } else {
        if (req?.session?.user?.account !== "admin") {
          query = "";
        }
      }
  
      const result = await pool.query(query, parameters);
  
      return res.status(200).json({ data: result?.rows?.[0] });
    } else {
      return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

getRoutes.get("/logoff", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    req.session.user = undefined;
    return res.cookie("sid", 'none', {
        expires: undefined,
        httpOnly: true,
    }).status(200).json({});
  } catch(err) {
    res.status(500).json({ error: err });
  }
});

getRoutes.get("/authenticate", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!!req?.session?.user?.status) {
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
      if (req?.session?.user?.account === "doctor") {
        query = "SELECT " +
            "users.id as userId, users.email as email, users.firstname as firstname, users.lastname as lastname, account.type as account, users.status as status, users.new_account as new_account, " +
            "doctors.id as doctorId, doctors.degreenumber as degreenumber, doctors.degreeseries as degreeseries, " +
            "doctors.graduationdate as graduationdate, doctors.college as college " +
          "FROM users " +
          "INNER JOIN account ON account.id = users.account " +
          `INNER JOIN doctors ON doctors.userid = users.id WHERE users.id = $1`;
      } else if ((req?.session?.user?.account === "admin" || !!req?.session?.user?.new_account)) {
        query = "SELECT "+
            "users.id as userId, email, firstname, lastname, account.type as account, status, new_account" +
            " FROM public.users " +
            `INNER JOIN account ON account.id = users.account WHERE users.id = $1`;
      }
      return pool.query(query,
      [req?.session?.user?.userid],
      function(error, results, fields) {
        if (error) {
          req.session.user = undefined;
          return res.cookie("sid", 'none', {
            expires: undefined,
            httpOnly: true,
          }).status(400).json({ error: error });
        } else {
          req.session.user = results?.rows?.[0];
          return res.status(200).json({ data: results?.rows?.[0] });
        }
      })
    } else {
      req.session = null;
      return res.cookie("sid", 'none', {
        expires: undefined,
        httpOnly: true,
      }).status(401).json({});
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});


module.exports = getRoutes;