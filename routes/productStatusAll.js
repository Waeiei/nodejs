const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

//ตรวจสอบสถานะเบิกสินค้า
async function getProductStatusPurchase() {
    try {
      let pool = await sql.connect(config);
      let res = await pool.request()
        .query(`SELECT Productreq.Req_Docno,Productreq.Req_Name,Productreq.Req_Date,Productreq.Req_Time,Productreq.Shop_ID_2
        ,Productreq.Status,Productpurchase.Ppur_TotalQty
        ,Productpurchase.Ppur_Docno,Productpurchase.Ppur_Date,Shop.Shop_Name
        FROM Productreq 
        INNER JOIN Productpurchase ON (Productpurchase.Ppur_Refno = Productreq.Req_Docno)
        INNER JOIN Shop ON (Shop.Shop_ID = Productreq.Shop_ID_2)
        WHERE Productreq.Status < 3 ORDER BY Productreq.Req_ID DESC`);
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.get("/productcheckStatus", (req, res) => {
    getProductStatusPurchase().then((result) => {
      res.json(result[0]);
    });
  });

  //ตรวจสอบสถานะโอนย้ายสินค้า
async function getProductMoveStatus() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Productmove.Pmove_Date,Productmove.Pmove_Time,Productmove.Pmove_Docno
      ,Productmove.Shop_ID_1,Productmove.Shop_ID_2,Productmove.Pmove_Type,Productmove.Pmove_Refno
      ,Productmove.Pmove_Total,Productmove.Pmove_TotalQty,Productmove.Status
      ,Shopreceive.Sre_Date,Shopreceive.Sre_Docno
      FROM Productmove 
      INNER JOIN Shopreceive ON (Productmove.Pmove_Refno = Shopreceive.Sre_Docno)
      WHERE Productmove.Status < 3 ORDER BY Productmove.Pmove_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/productmoveStatus", (req, res) => {
  getProductMoveStatus().then((result) => {
    res.json(result[0]);
  });
});



module.exports = router;
