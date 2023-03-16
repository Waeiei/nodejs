const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getSaleBoData() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Sale.Sale_Docno,Sale.Sale_Name,Sale.Sale_Refno,Sale.Sale_Date,Sale.Sale_Time
      ,Sale.Shop_ID,Sale.Shop_ID,Sale.Cus_ID,Sale.Sale_Type,Sale.Sale_Remark   
      ,Sale.Croff_Docno,Sale.Status,Sale.Create_Date,Receipt.Receipt_No 
      FROM Sale 
      INNER JOIN Receipt ON (Sale.Sale_Docno = Receipt.Sale_Docno)
      INNER JOIN Cashroundoff ON (Sale.Croff_Docno = Cashroundoff.Croff_Docno)
      WHERE Sale.Status = 1`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/salebodata", (req, res) => {
  getSaleBoData().then((result) => {
    res.json(result[0]);
  });
});

async function getShopData() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(`SELECT *
      FROM Shop 
      WHERE Status = 1`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/shopdata", (req, res) => {
  getShopData().then((result) => {
    res.json(result[0]);
  });
});

//เช็คว่าได้ใช้ตรงไหนหรือเปล่า
async function getProductDetail() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Shopdetail.Shop_ID,Shopdetail.Prod_ID,Shopdetail.Sdetail_Balance,Product.Prod_Name,Product.Prod_UID
      ,Productunit.Prod_UName,Product.Prod_Price
      FROM Shopdetail
      INNER JOIN Product ON (Product.Prod_ID = Shopdetail.Prod_ID)
      INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID)
      WHERE Shopdetail.Status = 1`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductdetail", (req, res) => {
  getProductDetail().then((result) => {
    res.json(result[0]);
  });
});

// get Shopdetail By from shop id innerjoid to product unit
async function getShopDetailById(id) {
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

router.get("/getshopdetailbyid/:id", (req, res) => {
  getShopDetailById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

//INSERT sale
async function postInsertSale(sale) {
  console.log("ข้อมูลจาก sale", sale);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`INSERT INTO Sale (Sale_ID,Sale_Date,Sale_Time,Sale_Type,Sale_Remark,Croff_Docno,Shop_ID,Cus_ID,Status,Create_Date,Create_User,Sale_Sum )
      VALUES ((SELECT MAX(Sale_ID) FROM Sale) +1,'${sale.dateFormat}','${sale.timeSave}','${sale.saleType}','${sale.saleRemark}','${sale.saleDoc}','${sale.saleShopId}','${sale.saleCusId}',
      '1','${sale.dateTime}','${sale.personalID}','${sale.calSum}')`);
    //res.recordset[0].Sale_ID
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertsale", (req, res) => {
  let sale = { ...req.body };
  postInsertSale(sale).then((result) => {
    res.status(201).json(result);
  });
});

//INSERT salelist
async function postInsertSaleList(saleList) {
  console.log("ข้อมูลจาก salelist", saleList);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Salelist (Sale_ID,Prod_ID,Sale_Docno,Salelist_Qty,Salelist_Sum,
          Salelist_Price,Prod_Price,Status,Create_Date,Create_User) 
        VALUES ((SELECT MAX(Sale_ID) FROM Sale),'${saleList.pId}','${saleList.saleDoc}',
        '${saleList.prodInsertCountSell}','${saleList.prodInsertSum}','${saleList.prodInsertPrice}','${saleList.prodInsertPrice}'
        ,'1','${saleList.dateTime}','${saleList.personalID}')`
    );
        //,'${saleList.getSaleID}' ถ้าใช้ได้ก็ลบทิ้ง
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertsalelist", (req, res) => {
  let saleList = { ...req.body };
  postInsertSaleList(saleList).then((result) => {
    res.status(201).json(result);
  });
});

/*
async function getSaleIDMax() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(`SELECT MAX(Sale_ID) AS getSaleID
      FROM Sale 
      WHERE Status = 1`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/gatsaleid", (req, res) => {
  getSaleIDMax().then((result) => {
    res.json(result[0]);
  });
});*/

//Get SaleData
async function getSaleData() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Sale.Sale_ID,Sale.Sale_Refno,Sale.Sale_Date,Sale.Sale_Time
    ,Sale.Shop_ID,Sale.Cus_ID,Sale.Sale_Sum,Sale.Sale_Type,Sale.Croff_Docno,Sale.Status,Customer.Cus_Name,Shop.Shop_Name
      FROM Sale 
      INNER JOIN Shop ON (Shop.Shop_ID = Sale.Shop_ID)
      INNER JOIN Customer ON (Customer.Cus_ID = Sale.Cus_ID)
      WHERE Sale.Status = 1 ORDER BY Sale_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getsaledata", (req, res) => {
  getSaleData().then((result) => {
    res.json(result[0]);
  });
});

async function getSaleDateById(id) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Sale.Sale_Refno,Sale.Sale_Date,Sale.Sale_Time,Sale.Shop_ID,Sale.Cus_ID,Sale.Sale_Type
        ,Sale.Sale_Remark,Sale.Croff_Docno,Sale.Sale_Sum,Sale.Create_User,Shop.Shop_Name,Customer.Cus_Name,Customer.Cus_CitizenID
        ,Customer.Cus_MNo,Personal.Per_Name,Personal.Per_Surname
        FROM Sale
        INNER JOIN Shop 
        ON Shop.Shop_ID = Sale.Shop_ID
        INNER JOIN Customer 
        ON Customer.Cus_ID = Sale.Cus_ID
        INNER JOIN Personal 
        ON Personal.Per_ID = Sale.Create_User
        WHERE Sale.Sale_ID = ${id} AND Sale.Status = 1 
        `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getsaledatebyid/:id", (req, res) => {
  getSaleDateById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function getSaleDateListById(id) {
  console.log(id);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Salelist.Prod_ID,Salelist.Salelist_Qty,Salelist.Prod_Price,Salelist.Salelist_Price,Salelist.Salelist_Sum
        ,Product.Prod_Name,Product.Prod_UID,Productunit.Prod_UName,Sale.Shop_ID,Shopdetail.Sdetail_Balance
        FROM Salelist
        INNER JOIN Product 
        ON Product.Prod_ID = Salelist.Prod_ID
        INNER JOIN Productunit 
        ON Product.Prod_UID = Productunit.Prod_UID
        INNER JOIN Sale 
        ON Sale.Sale_ID = Salelist.Sale_ID
        INNER JOIN Shopdetail 
        ON Shopdetail.Shop_ID = Sale.Shop_ID
        WHERE Salelist.Sale_ID = ${id} AND Salelist.Status = 1 AND Sale.Shop_ID = Shopdetail.Shop_ID AND Shopdetail.Prod_ID = Salelist.Prod_ID
        
        `
    );
    //  
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getsaledatelistbyid/:id", (req, res) => {
  getSaleDateListById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function delectSaleBo(saleID) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(
        `UPDATE Sale SET Status = 9 WHERE Sale_ID=${saleID}`
      );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.delete("/delectsalebo/:id", (req, res) => {
  delectSaleBo(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function delectSaleBoList(saleID) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(
        `UPDATE Salelist SET Status = 9 WHERE Sale_ID=${saleID}`
      );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.delete("/delectsalebolist/:id", (req, res) => {
  delectSaleBoList(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});




module.exports = router;
