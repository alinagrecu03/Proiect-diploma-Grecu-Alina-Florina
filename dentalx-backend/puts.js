const { putRoutes, pool, bcrypt } = require('./configuration');

// endpoint pentru modificarea datelor unui user
putRoutes.put("/users/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
  const {
    email,
    password,
    firstname,
    lastname
  } = req?.body ?? {};

  try {
    // verificam daca contul autentificat are drepturi si este activ
    if ((req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "admin"
        || req?.session?.user?.account === "patient")
        && !!req?.session?.user?.status
      ) {
        // verificam variabilele din request daca sunt goale
        if (!email || !firstname || !lastname) {
          throw Error("Invalid parameters");
        }
        const query = `UPDATE users SET email = ($1), firstname = ($2), lastname = ($3)${password ? ", password = ($4)" : ""} WHERE users.id = ($${password ? 5 : 4}) RETURNING email`;
        const params = [email, firstname, lastname];
        if (password) {
          params.push(password);
        }
        params.push(req.params.id);
        // realizam query-ul de update pentru tabela users
        const result = await pool.query(query, params);
        // daca rezultatul s-a facut cu bine returnam raspunsul cu status 200
        return res.status(200).json({ data: result?.rows });
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
    return res.status(500).json({ error: err });
  }
});

// endpoint pentru activarea/dezactivarea unui cont
putRoutes.put("/status-account/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
  const {
    status
  } = req?.body ?? {};

  try {
    // verificam daca contul autentificat are drepturi si este activ
    if (req?.session?.user?.account === "admin"
        && !!req?.session?.user?.status
      ) {
        // verificam parametrul din url daca e gol
        if (!req.params.id) {
          throw Error("Invalid parameters");
        }
        const query = "UPDATE users SET status = $1 WHERE users.id = ($2) RETURNING *";
        const params = [status, req.params.id];
        // realizam query-ul de update pentru tabela users
        const result = await pool.query(query, params);
        // daca rezultatul s-a facut cu bine returnam raspunsul cu status 200
        return res.status(200).json({ data: result?.rows });
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
    return res.status(500).json({ error: err });
  }
});

// endpoint-ul de modificare al parolei
putRoutes.put("/password/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
  const {
    oldPassword,
    newPassword
  } = req?.body ?? {};

  try {
    // verificam daca contul autentificat are drepturi si este activ
    if ((req?.session?.user?.account === "admin"
        || req?.session?.user?.account === "patient"
        || req?.session?.user?.account === "doctor")
        && !!req?.session?.user?.status
      ) {
        // verificam variabilele din request si parametrii din url daca sunt goale
        if (!req.params.id || !oldPassword || !newPassword) {
          throw Error("Invalid parameters");
        }
        // cautam user-ul dupa id
        const findUser = await pool.query("SELECT * FROM users WHERE users.id=$1", [req.params.id]);
        if (findUser?.rowCount > 0) {
          // daca gasim un user cu respectivul id comparam vechea parola criptata din baza de date cu ce a venit din request
          const match = await bcrypt.compare(oldPassword, findUser?.rows?.[0]?.password);
          if (!match) {
            // daca nu sunt la fel afisam eroare
            return res.status(400).json({error: "Old password incorrect!"});
          } else {
            // daca e la fel criptam noua parola si o setam in baza de date pentru respectivul user
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const query = "UPDATE users SET password = $1 WHERE users.id = ($2) RETURNING email";
            const params = [hashedPassword, req.params.id];
            const result = await pool.query(query, params);
            // daca query-ul s-a executat cu succes afisam raspunsul
            return res.status(201).json({ data: result?.rows });
          }
        } else {
          // daca nu gasim userul afisam eroare
          return res.status(400).json({error: "User not found!"});
        }
      } else {
        // afisam eroare daca userul nu are drepturi
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
  } catch(err) {
    // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
    return res.status(500).json({ error: err });
  }
});

// endpoint de modificare a datelor unui user care este pacient
putRoutes.put("/patient/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
    const {
      affections,
      treatments,
      allergies,
      interventions,
      doctor
    } = req?.body ?? {};
  
    try {
      // verificam daca contul autentificat are drepturi si este activ
      if ((req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "patient")
        && !!req?.session?.user?.status
      ) {
        // verificam parametrul din url daca e gol
        if (!req?.params?.id) {
          throw Error("Invalid parameters");
        }
        const query = "UPDATE patients SET" +
        ` affections = ($1), treatments = ($2), allergies = ($3), interventions = ($4)${doctor ? ", doctor = ($5)" : ""} WHERE patients.userid = ($${doctor ? 6 : 5}) RETURNING *`;
        const parameters = doctor
        ? [affections, treatments, allergies, interventions, doctor, req.params.id]
        : [affections, treatments, allergies, interventions, req.params.id];
        const result = await pool.query(query, parameters);
        // daca query-ul de update se realizeaza cu succes afisam raspunsul
        return res.status(200).json({ data: result?.rows?.[0] });
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
      return res.status(500).json({ error: err });
    }
});

// endpoint de modificare al stocului de marfa
putRoutes.put("/stock/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
    const {
      name,
      category,
      quantity,
      is_reusable,
      price,
      date_buyed
    } = req?.body ?? {};
    const categoryCheck = category === "CF" || category === "CV";
    try {
      // verificam daca contul autentificat are drepturi si este activ
      if (req?.session?.user?.account === "doctor"
        && !!req?.session?.user?.status
      ) {
        // verificam variabilele din request daca sunt goale sau au anumite valori
        if (!category || !categoryCheck
          || !quantity || is_reusable === undefined || price === undefined
          || !date_buyed || !req?.params?.id) {
          throw Error("Invalid parameters");
        }
    
        const result = await pool.query("UPDATE stock SET name=$1, category=$2, quantity=$3, is_reusable=$4, price=$5, date_buyed=$6 WHERE id=$7 RETURNING *"
        , [name, category, quantity, is_reusable, price, date_buyed, req.params.id]);
        // daca query-ul este cu succes afisam raspunsul
        return res.status(200).json({ data: result.rows });
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
      return res.status(500).json({ error: err });
    }
});

// endpoint pentru modificarea unui doctor
putRoutes.put("/doctor/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
    const {
      degreenumber,
      degreeseries,
      graduationdate,
      college
    } = req?.body ?? {};
  
    try {
      // verificam daca contul autentificat are drepturi si este activ
      if (req?.session?.user?.account === "doctor"
        && !!req?.session?.user?.status
      ) {
        // verificam variabilele si parametrii din url daca sunt goale
        if (!degreenumber || !degreeseries || !graduationdate || !college || !req?.params?.id) {
          throw Error("Invalid parameters");
        } 
    
        const result = await pool.query("UPDATE doctors SET" +
        " degreenumber = ($1), degreeseries = ($2), graduationdate = ($3), college = ($4) WHERE doctors.userid = ($5) RETURNING *"
        , [degreenumber, degreeseries, graduationdate, college, req.params.id]);
        if (result?.rowCount > 0) {
          // daca contul de medic este unul nou, atunci setam flag-ul new_account pe false ca sa nu
          // se mai afiseze pagina UpdateProfile din frontend
          const changeNewAccStat = await pool.query("UPDATE users SET" +
          " new_account = ($1) WHERE users.id = ($2) RETURNING *"
          , [false, req.params.id]);
          // daca rezultatul s-a facut cu bine returnam raspunsul cu status 200
          return res.status(200).json({ data: changeNewAccStat?.rows }); 
        } else {
          // daca user-ul nu a fost modificat afisam mesaj de not modified
          return res.status(304).json({ error: "NOT_MODIFIED" });
        }
      } else {
        // daca user-ul nu are drepturi afisam mesaj
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
      return res.status(500).json({ error: err });
    }
});

// endpoint pentru modificarea rezervarilor
putRoutes.put("/reservation/:id", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    // extragem variabilele din body
    const {
      datetime,
      type,
      details,
      status
    } = req?.body ?? {};
  
    try {
      // verificam daca contul autentificat are drepturi si este activ
      if ((req?.session?.user?.account === "doctor"
        || req?.session?.user?.account === "patient")
        && !!req?.session?.user?.status
      ) {
        // verificam variabilele din request si parametrii din url daca sunt goale
        if (!datetime || !type || !details || !status || !req?.params?.id)  {
          throw Error("Invalid parameters");
        } 
    
        const result = await pool.query("UPDATE reservations SET" +
        " datetime = ($1), type = ($2), details = $3, status = $4 WHERE reservations.id = ($5) RETURNING *"
        , [datetime, type, details, status, req.params.id]);
        // daca rezultatul s-a facut cu bine returnam raspunsul cu status 200
        return res.status(201).json({ data: result?.rows });
      } else {
        // daca nu are drepturi returnam eroare
        return res.status(403).json({ error: "DONT_HAVE_PERMISSIONS" });
      }
    } catch(err) {
      // daca query-ul s-a facut cu eroare sau variabilele din request sunt goale returnam eroarea
      return res.status(500).json({ error: err });
    }
});

// endpoint pentru modificarea invitatiilor
putRoutes.put("/invitation/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // extragem variabilele din body
  const {
    status_old_doctor,
    status_patient,
    status_new_doctor,
    details_old_doctor,
    details_patient,
    details_new_doctor
  } = req?.body ?? {};

  try {
    // verificam daca contul autentificat are drepturi si este activ
    if ((req?.session?.user?.account === "doctor"
      || req?.session?.user?.account === "patient")
      && !!req?.session?.user?.status
    ) {
      // verificam parametrul din url daca e gol
      if (!req?.params?.id)  {
        throw Error("Invalid parameters");
      } 
  
      const result = await pool.query("UPDATE invitations SET" +
      " status_old_doctor = ($1), status_patient = ($2), status_new_doctor = ($3), details_old_doctor = ($4), details_patient = ($5), details_new_doctor = ($6) WHERE invitations.id = ($7) RETURNING *"
      , [status_old_doctor, status_patient, status_new_doctor, details_old_doctor, details_patient, details_new_doctor, req.params.id]);
      const response = result?.rows?.[0];
      // daca in urma modificarii invitatia are toate cele 3 status-uri pe true atunci mutam pacientul la noul doctor
      if (response?.status_patient && response?.status_old_doctor && response?.status_new_doctor) {
        const changeDoctor = await pool.query("UPDATE patients SET doctor=$1 WHERE patients.userid=$2 RETURNING *", [response?.new_doctor, response?.patient]);
        if (changeDoctor?.rowCount > 0) {
          // daca pacientul a fost mutat cu succes stergem evenimentele de la vechiul doctor pentru pacientul respectiv
          await pool.query("DELETE FROM reservations WHERE reservations.createdby=$1 AND reservations.doctor=$2 RETURNING *", [response?.patient, response?.old_doctor]);
          // si mutam documentele pacientului la noul doctor
          await pool.query("UPDATE documents SET doctor=$1 WHERE patient=$2 RETURNING *", [response?.new_doctor, response?.patient]);
          // daca rezultatul s-a facut cu bine returnam raspunsul cu status 200
          return res.status(201).json({ data: result?.rows });
        } else {
          // daca doctorul nu a fost schimbat afisam eroare
          return res.status(400).json({ data: [] });
        }
      } else {
        // daca status-urile nu sunt toate pe true afisam mesaj de modificare cu succes
        return res.status(201).json({ data: result?.rows });
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

module.exports = putRoutes;