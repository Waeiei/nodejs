const express = require("express")
const router = express.Router()

const sql = require('mssql')
let config = require('../dbconfig')


async function getData() {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query(`SELECT Personal.Per_ID,Personal.Per_Name,
        Personal.Per_Surname,Personal.Per_GID,Personal.Per_Login_ID,Personal.Per_Login_Password,Personal.Per_Picture
        ,Personal.Per_Remark,Personal.Status,Personalgroup.Per_GName FROM Personal
        INNER JOIN Personalgroup ON (Personal.Per_GID = Personalgroup.Per_GID) WHERE Personal.Status = 1 OR Personal.Status = 9 ORDER BY Personal.Per_ID DESC `);
        console.log("SQL Connect Success" );
        return res.recordsets;
    } catch (error) {
        console.log("SQL Connect Error is "+error);
    }
}
router.get('/personal', (req,res) =>{
   getData().then((result) => {
    res.json(result[0])
   })
})

async function getDataID(personalId) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().input('input_parameter',sql.Int,personalId)
        .query("SELECT * FROM Personal WHERE Per_Login_ID = @input_parameter")
        return res.recordsets;
    } catch (error) {
        console.log("SQL Connect Error is "+error);
    }
}
router.get('/personal/:id', (req,res) =>{
    getDataID(req.params.id).then((result) => {
    res.json(result[0])
   })
})

async function getDataPersonalgroup() {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query(`SELECT * FROM Personalgroup`);
        console.log("SQL Connect Success" );
        return res.recordsets;
    } catch (error) {
        console.log("SQL Connect Error is "+error);
    }
}
router.get('/personalgroup', (req,res) =>{
    getDataPersonalgroup().then((result) => {
    res.json(result[0])
   })
})

async function postInsertPersonalData(personalData) {
    console.log(personalData);
    try {
      let pool = await sql.connect(config);
      let res = await pool.request()
      .query(`INSERT INTO Personal (Per_ID,Per_Name,Per_Surname,Per_GID,Per_Login_ID,Per_Login_Password,Per_Remark,Status
        ,Create_Date,Create_User,Update_Time) VALUES ((SELECT MAX(Per_ID) FROM Personal) +1,'${personalData.perName}','${personalData.perSurname}',
        ${personalData.perGID},${personalData.perLoginId},'${personalData.perPassword}','${personalData.perRemark}'
        ,'1','${personalData.dateTime}',${personalData.personalID},'${personalData.timeSave}')`)
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.post("/products/insertpersonal", (req, res) => {
    let personal = { ...req.body };
    postInsertPersonalData(personal).then((result) => {
      res.status(201).json(result);
    });
  });

  async function postDelectPersonalData(perID) {
    try {
      let pool = await sql.connect(config);
  
      let res = await pool
        .request()
        .query(`UPDATE Personal SET Status = 0 WHERE Per_ID=${perID} `);
  
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.delete("/products/delectpersonal/:id", (req, res) => {
    postDelectPersonalData(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });

  async function getDataPersonalById(id) {
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `SELECT Personal.Per_ID,Personal.Per_Name,Personal.Per_Surname,Personal.Per_GID,Personal.Per_Login_ID,
          Personal.Per_Login_Password,Personal.Per_Picture,Personal.Per_Remark,Personal.Status
          FROM Personal
          INNER JOIN Personalgroup ON (Personal.Per_GID = Personalgroup.Per_GID)
          WHERE Personal.Per_ID = ${id}
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.get("/products/getDataPersonalbyid/:id", (req, res) => {
    getDataPersonalById(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });

  async function updatePersonalData(Id,data) {
    console.log(data);
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `UPDATE Personal
          SET Per_Name='${data.name}',
          Per_Surname='${data.surname}',
          Per_GID='${data.gid}',
          Per_Login_ID='${data.login}',
          Per_Login_Password='${data.password}',
          Per_Remark='${data.remark}',
          Status='${data.status}',
          Update_Date='${data.dateTime}',
          Update_Time='${data.timeSave}',
          Update_User='${data.personalID}'
          WHERE Per_ID = ${Id}
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.put("/products/updatePersonaldata/:id", (req, res) => {
    let updatePersonal = { ...req.body };
    updatePersonalData(req.params.id,updatePersonal).then((result) => {
      res.status(201).json(result);
    });
  });

module.exports = router