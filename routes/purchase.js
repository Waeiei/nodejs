const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function postInsertPurchase(purchase) {
  console.log("ข้อมูลจาก purchase", purchase);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Productpurchase (Ppur_ID,Ppur_Name,Ppur_Date,Ppur_Time,Sup_ID,Shop_ID,
          Ppur_Remark,Status,Create_Date,Create_User,Ppur_Docno,Ppur_BillTotal,Ppur_TotalQty,Ppur_Refno) 
          VALUES ((SELECT MAX(Ppur_ID) FROM Productpurchase) +1,'สั่งซื้อสินค้า','${purchase.purDate}',
          '${purchase.timeSave}','${purchase.purSupID}','${purchase.purShopID}',''
          ,'0','${purchase.dateTime}','${purchase.personalID}','${purchase.purDocno}','${purchase.calSum}'
          ,'${purchase.calCount}','${purchase.purRefTreq}')`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertpurchase", (req, res) => {
  let purchase = { ...req.body };
  postInsertPurchase(purchase).then((result) => {
    res.status(201).json(result);
  });
});

async function postInsertPurchaseList(purchaseList) {
  console.log("ข้อมูลจาก purchaseList", purchaseList);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Productpurchaselist (Ppur_ID,Purlist_Refno,Shop_ID,Prod_ID,Ppurlist_Qty,
        Status,Create_Date,Create_User,Ppur_Docno) 
          VALUES ((SELECT MAX(Ppur_ID) FROM Productpurchase),'${purchaseList.purRefTreq}','${purchaseList.purShopID}',
          '${purchaseList.prodListID}','${purchaseList.prodListCount}','1'
          ,'${purchaseList.dateTime}','${purchaseList.personalID}','${purchaseList.purDocno}')`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertpurchaselist", (req, res) => {
  let purchaseList = { ...req.body };
  postInsertPurchaseList(purchaseList).then((result) => {
    res.status(201).json(result);
  });
});

async function getProductPurchase() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Productpurchase.Ppur_ID,Productpurchase.Ppur_Name,Productpurchase.Ppur_Date,Productpurchase.Ppur_Time
      ,Productpurchase.Sup_ID,Productpurchase.Shop_ID,Productpurchase.Ppur_BillTotal,Productpurchase.Ppur_Docno
      ,Shop.Shop_Name,Supplier.Sup_Name
      FROM Productpurchase 
      INNER JOIN Shop ON (Shop.Shop_ID = Productpurchase.Shop_ID)
      INNER JOIN Supplier ON (Supplier.Sup_ID = Productpurchase.Sup_ID)
      WHERE Productpurchase.Status < 2 ORDER BY Productpurchase.Ppur_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getpurchase", (req, res) => {
  getProductPurchase().then((result) => {
    res.json(result[0]);
  });
});

async function getProductpurchaseById(id) {
  console.log(id);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Productpurchase.Ppur_Name,Productpurchase.Ppur_Date,Productpurchase.Ppur_Time,
      Productpurchase.Sup_ID,Productpurchase.Shop_ID,Productpurchase.Ppur_Docno,Productpurchase.Create_User 
      ,Productpurchase.Ppur_TotalQty,Productpurchase.Ppur_Refno
      ,Productpurchase.Ppur_BillTotal,Productpurchase.Ppur_ID
      ,Supplier.Sup_Name,Supplier.Sup_TNo,Supplier.Sup_MNo
      ,Personal.Per_Name,Personal.Per_Surname
      FROM Productpurchase
    INNER JOIN Supplier ON (Supplier.Sup_ID = Productpurchase.Sup_ID)
    INNER JOIN Personal ON (Personal.Per_ID = Productpurchase.Create_User)
    WHERE Productpurchase.Ppur_ID = ${id} AND Productpurchase.Status < 3
    `);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductpurchasebyid/:id", (req, res) => {
  getProductpurchaseById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function getProductpurchaseListById(doc) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Productpurchaselist.Ppur_Docno,Productpurchaselist.Prod_ID,Productpurchaselist.Ppurlist_Qty,Productpurchaselist.Purlist_Refno,
      Product.Prod_Price,Product.Prod_Name,Product.Prod_UID,Productunit.Prod_UName
      ,Productpurchase.Shop_ID,Shopdetail.Sdetail_Balance
    FROM Productpurchaselist
    INNER JOIN Product ON (Product.Prod_ID = Productpurchaselist.Prod_ID)
    INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID)
    INNER JOIN Productpurchase ON (Productpurchase.Ppur_Docno = Productpurchaselist.Ppur_Docno)
    INNER JOIN Shopdetail ON (Shopdetail.Shop_ID = Productpurchase.Shop_ID)
    WHERE Productpurchaselist.Ppur_Docno = ${doc} AND Productpurchaselist.Status = 1 AND Productpurchase.Shop_ID = Shopdetail.Shop_ID AND Shopdetail.Prod_ID = Productpurchaselist.Prod_ID
    `);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductpurchaselistbyid/:doc", (req, res) => {
  getProductpurchaseListById(req.params.doc).then((result) => {
    res.status(201).json(result);
  });
});

module.exports = router;
