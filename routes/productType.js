const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getDataProductType() {
    try {
      
      let pool = await sql.connect(config);
      let res = await pool.request()
      .query(`SELECT Producttype.Prod_TID,Producttype.Prod_TName,Productgroup.Prod_GName 
      FROM Producttype INNER JOIN Productgroup 
      ON Producttype.Prod_GID = Productgroup.Prod_GID WHERE Producttype.Status = 1 ORDER BY Producttype.Prod_TID DESC`);
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  async function delectProductType(typeID){
    try {
      let pool = await sql.connect(config);
  
      let res = await pool
        .request()
        .query(`UPDATE Producttype SET Status = 0 WHERE Prod_TID=${typeID} `);
  
      return res.recordsets;
    } catch (error){
      console.log("SQL Connect Error is " + error);
    }
  }

  async function insertProductType(data) {
    console.log("data",data);
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(`INSERT INTO Producttype (Prod_TID,Prod_TName,Prod_GID,Status,Create_Date,Create_User) 
      VALUES ((SELECT MAX(Prod_TID) FROM Producttype) +1,'${data.prodTName}','${data.prodGroupInsert}','1','${data.dateTime}','${data.personalID}')`);
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.get("/producttypedata", (req, res) => {
    
    getDataProductType().then((result) => {
      res.json(result[0]);
    });
  });

  router.delete("/producttype/delectproducttype/:id", (req, res) => {
    delectProductType(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });

  router.post("/producttype/insertproducttype", (req, res) => {
    let data = { ...req.body };
    insertProductType(data).then((result) => {
      res.status(201).json(result)
    });
  });

  async function getDataProductTypeById(id) {
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `SELECT Producttype.Prod_TID,Producttype.Prod_TName,Productgroup.Prod_GName,Productgroup.Prod_GID
          FROM Producttype
          INNER JOIN Productgroup 
          ON Producttype.Prod_GID = Productgroup.Prod_GID
          WHERE Producttype.Prod_TID = ${id} AND Producttype.Status = 1
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.get("/products/getDataProductTypeById/:id", (req, res) => {
    getDataProductTypeById(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });
  
  async function updateproducttype(Id,data) {
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `UPDATE Producttype
          SET Prod_TName='${data.prodTName}',
          Prod_GID='${data.prodGID}',
          Update_Date='${data.dateTime}',
          Update_Time='${data.timeSave}',
          Update_User='${data.personalID}'
          WHERE Prod_TID = ${Id}
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.put("/products/updateproducttype/:id", (req, res) => {
    let updateproductsType = { ...req.body };
    updateproducttype(req.params.id,updateproductsType).then((result) => {
      res.status(201).json(result);
    });
  });

module.exports = router;