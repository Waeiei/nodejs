const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getById(id) {
    try {
      let pool = await sql.connect(config);
      let res = await pool.request()
        .query(`SELECT Shopdetail.Shop_ID,Shopdetail.Prod_ID,Shopdetail.Sdetail_Balance,Product.Prod_Name
        ,Product.Prod_Price,Product.Prod_UID,Productunit.Prod_UName
      FROM Shopdetail
      INNER JOIN Product ON (Product.Prod_ID = Shopdetail.Prod_ID)
      INNER JOIN Productunit ON (Productunit.Prod_UID = Product.Prod_UID)
      WHERE Shopdetail.Shop_ID = ${id}
      `);
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.get("/getbyid/:id", (req, res) => {
    getById(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });

module.exports = router;
