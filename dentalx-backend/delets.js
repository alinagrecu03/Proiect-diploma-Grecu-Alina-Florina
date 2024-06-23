const { deleteRoutes, pool, fs, path } = require('./configuration');

deleteRoutes.delete("/users/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req?.params?.id) {
    throw Error("Invalid id");
  }
  try {
    if (!!req?.session?.user?.status
      && req?.session?.user?.account === "admin") {
        const resultFileNames = await pool.query("SELECT documents.name FROM documents WHERE documents.user_id = $1", [req.params.id]);
        if (resultFileNames?.rows?.length > 0) {
          resultFileNames?.rows?.forEach((file) => fs.unlinkSync(path.resolve(__dirname, `./public/pdfs/${file.name}`)));
        }
        const result = await pool.query(`WITH 
        delete_documents AS 
              ( DELETE FROM documents
                WHERE documents.user_id = $1
                RETURNING documents.id as documents_id, documents.user_id as document_userid
              ),
        delete_patients AS
              ( DELETE FROM patients
                WHERE patients.userid = $1
              RETURNING patients.id as patients_id, patients.userid as patient_userid
              ),
        delete_doctors AS
              ( DELETE FROM doctors
                WHERE doctors.userid = $1
              RETURNING doctors.id as doctors_id, doctors.userid as doctor_userid
              ),
        delete_stock AS
              ( DELETE FROM stock
                WHERE stock.doctor_id = (SELECT doctors.id FROM doctors WHERE userid = $1)
              RETURNING stock.id as stock_id, stock.doctor_id as stock_doctor_id
              ),
        delete_reservations AS
              (DELETE FROM reservations 
                WHERE reservations.createdby = (SELECT patients.id FROM patients WHERE userid = $1)
                OR reservations.doctor = (SELECT doctors.id FROM doctors WHERE userid = $1)
                RETURNING reservations.doctor as reservations_doctor, reservations.createdby as reservations_patient
              ),
        delete_users AS
              (DELETE FROM users 
                WHERE users.id = $1
              RETURNING users.id as users_id
              )
            SELECT
                *
            FROM delete_users
          LEFT JOIN delete_documents ON delete_users.users_id = delete_documents.document_userid
          LEFT JOIN delete_doctors ON delete_documents.document_userid = delete_doctors.doctor_userid
          LEFT JOIN delete_patients ON delete_doctors.doctors_id = delete_patients.patient_userid
          LEFT JOIN delete_reservations ON delete_patients.patients_id = delete_reservations.reservations_patient
        `, [req.params.id]);
        return res.status(200).json({ rowAffected: result?.rows?.length });
    } else {
      return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
    }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

deleteRoutes.delete("/patient/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
    if (!req?.params?.id) {
      throw Error("Invalid id");
    }
    try {
      if (!!req?.session?.user?.status
        && req?.session?.user?.account === "admin") {
          const result = await pool.query(`WITH 
            delete_patients AS
              ( DELETE FROM patients
                WHERE patients.id = $1
              RETURNING patients.id as patients_id, patients.userid as patient_userid
              ),
            delete_reservations AS
              (DELETE FROM reservations 
                WHERE reservations.createdby = $1
              RETURNING reservations.doctor as reservations_doctor, reservations.createdby as reservations_patient
              )
            SELECT
                *
            FROM delete_patients
            LEFT JOIN delete_reservations ON delete_reservations.reservations_patient = delete_patients.patients_id
          `, [req.params.id]);
          return res.status(200).json({ rowAffected: result?.rows?.length });
        } else {
          return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
        }
    } catch(err) {
      return res.status(500).json({ error: err });
    }
});

// endpoint pentru stergerea unui doctor
deleteRoutes.delete("/doctor/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // verificam parametrii din url
  if (!req?.params?.id) {
    throw Error("Invalid id");
  }
  try {
    // verificam daca userul are drepturi si daca contul este activ
    if (!!req?.session?.user?.status
      && req?.session?.user?.account === "admin") {
        // facem un query compus in care stergem pe rand toate datele din tabelele care au de-a face cu un doctor
        const result = await pool.query(`WITH 
          delete_doctors AS
            ( DELETE FROM doctors
              WHERE doctors.id = $1
            RETURNING doctors.id as doctors_id, doctors.userid as doctor_userid
            ),
          delete_reservations AS
            (DELETE FROM reservations 
              WHERE reservations.doctor = $1
            RETURNING reservations.doctor as reservations_doctor, reservations.createdby as reservations_patient
            ),
          delete_stock AS
              ( DELETE FROM stock
                WHERE stock.doctor_id = $1
              RETURNING stock.id as stock_id, stock.doctor_id as stock_doctor_id
              ),
          SELECT
              *
          FROM delete_doctors
          LEFT JOIN delete_reservations ON delete_reservations.reservations_doctor = delete_doctors.doctors_id
          LEFT JOIN delete_stock ON delete_stock.stock_doctor_id = delete_doctors.doctors_id
        `, [req.params.id]);
        // daca stergerea compusa s-a facut cu succes si toate datele legate de un doctor au fost sterse cu succes afisam raspunsul
        return res.status(200).json({ rowAffected: result?.rows?.length });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

deleteRoutes.delete("/reservation/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req?.params?.id) {
    throw Error("Invalid id");
  }
  try {
    if (!!req?.session?.user?.status
      && (req?.session?.user?.account === "admin"
      || req?.session?.user?.account === "doctor"
      || req?.session?.user?.account === "patient")) {
        const result = await pool.query("DELETE FROM reservations WHERE reservations.id = $1 RETURNING *", [req.params.id]);
        return res.status(200).json({ rowAffected: result?.rows?.length });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

deleteRoutes.delete("/stock/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req?.params?.id) {
    throw Error("Invalid id");
  }
  try {
    if (!!req?.session?.user?.status && req?.session?.user?.account === "doctor") {
        const result = await pool.query("DELETE FROM stock WHERE stock.id = $1 RETURNING *", [req.params.id]);
        return res.status(200).json({ rowAffected: result?.rows?.length });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

deleteRoutes.delete("/stock/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req?.params?.id) {
    throw Error("Invalid id");
  }
  try {
    if (!!req?.session?.user?.status
      && (req?.session?.user?.account === "doctor"
      || req?.session?.user?.account === "admin")) {
        const result = await pool.query("DELETE FROM stock WHERE stock.id = $1 RETURNING *", [req.params.id]);
        return res.status(200).json({ rowAffected: result?.rows?.length });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

deleteRoutes.delete("/order/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req?.params?.id) {
    throw Error("Invalid id");
  }
  try {
    if (!!req?.session?.user?.status && (req?.session?.user?.account === "admin" || req?.session?.user?.account === "doctor")) {
        const result = await pool.query("DELETE FROM orders WHERE orders.id = $1 RETURNING *", [req.params.id]);
        return res.status(200).json({ rowAffected: result?.rows?.length });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

deleteRoutes.delete("/invitation/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!req?.params?.id) {
    throw Error("Invalid id");
  }
  try {
    if (!!req?.session?.user?.status && req?.session?.user?.account === "admin") {
        const result = await pool.query("DELETE FROM invitations WHERE invitations.id = $1 RETURNING *", [req.params.id]);
        return res.status(200).json({ rowAffected: result?.rows?.length });
      } else {
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    return res.status(500).json({ error: err });
  }
});

module.exports = deleteRoutes;