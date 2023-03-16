const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function postInsertBorecive(boreceive) {
  console.log("ข้อมูลจาก boreceive", boreceive);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Shopreceive (Sre_ID,Sre_Name,Sre_Refno,Sre_Date,Sre_Time,Shop_ID_1,
        Shop_ID_2,Status,Create_Date,Create_User,Sre_Docno,Sre_Total,Sre_TotalQty) 
          VALUES ((SELECT MAX(Sre_ID) FROM Shopreceive) +1,'รายการรับสินค้า','${boreceive.treqRefno}',
          '${boreceive.receiveDate}','${boreceive.timeSave}','${boreceive.receiveShop1}','${boreceive.receiveShop2}'
          ,'1','${boreceive.dateTime}','${boreceive.personalID}','${boreceive.receiveDoc}','${boreceive.calSum}','${boreceive.calCount}' )`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertboreceive", (req, res) => {
  let boreceive = { ...req.body };
  postInsertBorecive(boreceive).then((result) => {
    res.status(201).json(result);
  });
});

async function postInsertBoreciveList(boreceivelist) {
  console.log("ข้อมูลจาก boreceivelist", boreceivelist);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Shopreceivelist (Prod_ID,Srelist_Qty,Status,Create_Date,Create_User,Sre_Docno) 
            VALUES ('${boreceivelist.prodListID}',
            '${boreceivelist.prodListCount}','1','${boreceivelist.dateTime}','${boreceivelist.personalID}'
            ,'${boreceivelist.receiveDoc}')`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertboreceivelist", (req, res) => {
  let boreceivelist = { ...req.body };
  postInsertBoreciveList(boreceivelist).then((result) => {
    res.status(201).json(result);
  });
});

async function getDataShopreceive() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Sre_ID,Sre_Name,Sre_Docno,Sre_Refno,Sre_Date,Sre_Time,
        Shop_ID_1,Shop_ID_2,Status,Sre_TotalQty
        FROM Shopreceive
        WHERE Status <3 ORDER BY Sre_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getshopreceive", (req, res) => {
  getDataShopreceive().then((result) => {
    res.json(result[0]);
  });
});

async function getBoreceiveById(iddoc) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Shopreceive.Sre_Name,Shopreceive.Sre_Refno,Shopreceive.Sre_Docno
        ,Shopreceive.Sre_Date,Shopreceive.Sre_Time,Shopreceive.Shop_ID_1,Shopreceive.Shop_ID_2,Shopreceive.Sre_Total
        ,Shopreceive.Sre_TotalQty,Shopreceive.Create_User,Shopreceive.Update_User,Shopreceive.Status,Personal.Per_Name,Personal.Per_Surname
      FROM Shopreceive
      INNER JOIN Personal ON (Personal.Per_ID = Shopreceive.Create_User)
      WHERE Shopreceive.Sre_Docno = ${iddoc} AND Shopreceive.Status <3 >
      `);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getboreceivebyid/:iddoc", (req, res) => {
  console.log(req.params.iddoc);
  getBoreceiveById(req.params.iddoc).then((result) => {
    res.status(201).json(result);
  });
});

async function getShopreceiveListById(iddoc) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Shopreceivelist.Sre_Docno,Shopreceivelist.Prod_ID,Shopreceivelist.Srelist_Qty,
        Product.Prod_Price,Product.Prod_Name,Product.Prod_UID,Productunit.Prod_UName,Shopreceive.Shop_ID_1
        ,Shopdetail.Sdetail_Balance
      FROM Shopreceivelist
      INNER JOIN Product ON (Product.Prod_ID = Shopreceivelist.Prod_ID)
      INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID)
      INNER JOIN Shopreceive ON (Shopreceive.Sre_Docno = Shopreceivelist.Sre_Docno)
      INNER JOIN Shopdetail ON (Shopdetail.Shop_ID = Shopreceive.Shop_ID_1)
      WHERE Shopreceivelist.Sre_Docno = ${iddoc} AND Shopdetail.Prod_ID = Shopreceivelist.Prod_ID
      `);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getshopreceivelistbyid/:iddoc", (req, res) => {
  getShopreceiveListById(req.params.iddoc).then((result) => {
    res.status(201).json(result);
  });
});

async function updateShopreceive(iddoc,data) {
  console.log(data);
  try {
    let pool = await sql.connect(config);
    let res = await pool
      .request()
      .query(
        `UPDATE Shopreceive
        SET Update_Date='${data.dateTime}',
        Update_Time='${data.timeSave}',
        Update_User='${data.personalID}',
        Status = '${data.sreStatus}'
        WHERE Sre_Docno = ${iddoc}
        `
      );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.put("/updateshopreceive/:iddoc", (req, res) => {
  let updatereceive = { ...req.body };
  updateShopreceive(req.params.iddoc,updatereceive).then((result) => {
    res.status(201).json(result);
  });
});

async function postDelectshopreiveData(id) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(`UPDATE Shopreceive SET Status = 9 WHERE Sre_ID=${id} `);

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.delete("/delectshopreive/:id", (req, res) => {
  postDelectshopreiveData(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});


module.exports = router;
