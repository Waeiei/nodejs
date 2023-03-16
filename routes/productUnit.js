const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getDataProductsUnit() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(`SELECT * FROM Productunit WHERE Status = 1 ORDER BY Prod_UID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/productunit",async (req, res) => {
  await getDataProductsUnit().then((result) => {
    res.json(result[0]);
  });
});

async function insertProductUnit(data) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`INSERT INTO Productunit (Prod_UID,Prod_UName,Status,Create_Date,Create_User) 
      VALUES ((SELECT MAX(Prod_UID) FROM Productunit) +1,'${data.prodUnit}','1','${data.dateTime}','${data.personalID}')`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function delectProductUnit(Id) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(`UPDATE Productunit SET Status = 0 WHERE Prod_UID=${Id} `);

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}



router.post("/productunit/insertproductunit", (req, res) => {
  let data = { ...req.body };
  insertProductUnit(data).then((result) => {
    res.status(201).json(result);
  });
});

router.delete("/productunit/delectproductunit/:id", (req, res) => {
  delectProductUnit(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function getDataProductunitById(id) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Productunit.Prod_UID,Productunit.Prod_UName
          FROM Productunit
          WHERE Productunit.Prod_UID = ${id} AND Productunit.Status = 1
          `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/products/getDataProductunitById/:id", (req, res) => {
  getDataProductunitById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function updateproductunit(Id,data) {
  try {
    let pool = await sql.connect(config);
    let res = await pool
      .request()
      .query(
        `UPDATE Productunit
        SET Prod_UName='${data.prodUnitData}',
        Update_Date='${data.dateTime}',
        Update_Time='${data.timeSave}',
        Update_User='${data.personalID}'
        WHERE Prod_UID = ${Id}
        `
      );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.put("/products/updateproductunit/:id", (req, res) => {
  let updateproductsUnit = { ...req.body };
  updateproductunit(req.params.id,updateproductsUnit).then((result) => {
    res.status(201).json(result);
  });
});

module.exports = router;
