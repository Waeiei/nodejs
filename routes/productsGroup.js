const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getDataProductsGroup() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query("SELECT * FROM Productgroup WHERE Status = 1 ORDER BY Prod_GID DESC");
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function insertProductGroup(data) {
  try {
    let pool = await sql.connect(config);
    let res = await pool
      .request()
      .query(`INSERT INTO Productgroup (Prod_GID,Prod_GName,Status,Create_Date,Create_User) 
    VALUES ((SELECT MAX(Prod_GID) FROM Productgroup) +1,'${data.prodGName}','${data.prodGStatus}','${data.dateTime}','${data.personalID}')`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function delectProductData(groupID){
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(`UPDATE Productgroup SET Status = 0 WHERE Prod_GID=${groupID} `);

    return res.recordsets;
  } catch (error){
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/productgroup", (req, res) => {
  getDataProductsGroup().then((result) => {
    res.json(result[0]);
  });
});

router.post("/productgroup/insertproductgroup", (req, res) => {
  let productgroup = { ...req.body };
  insertProductGroup(productgroup).then((result) => {
    res.status(201).json(result)
  });
});

router.delete("/productgroup/delectproductgroup/:id", (req, res) => {
  delectProductData(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function getDataProductgroupById(id) {
  try {
    let pool = await sql.connect(config);
    let res = await pool
      .request()
      .query(
        `SELECT Productgroup.Prod_GID,Productgroup.Prod_GName
        FROM Productgroup
        WHERE Productgroup.Prod_GID = ${id} AND Productgroup.Status = 1
        `
      );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/products/getDataProductgroupById/:id", (req, res) => {
  getDataProductgroupById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function updateproductgroup(Id,data) {
  try {
    let pool = await sql.connect(config);
    let res = await pool
      .request()
      .query(
        `UPDATE Productgroup
        SET Prod_GName='${data.getNameGroup}',
        Update_Date='${data.dateTime}',
        Update_Time='${data.timeSave}',
        Update_User='${data.personalID}'
        WHERE Prod_GID = ${Id}
        `
      );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.put("/products/updateproductgroup/:id", (req, res) => {
  let updateproductsGroup = { ...req.body };
  updateproductgroup(req.params.id,updateproductsGroup).then((result) => {
    res.status(201).json(result);
  });
});


module.exports = router;
