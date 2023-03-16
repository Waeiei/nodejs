const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getCloseSaleDate(date) {
  console.log("date", date);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Sale_ID,Sale_Date,Sale_Time,Sale_Type,Sale_Sum
      FROM Sale 
      WHERE Status = 1 AND Sale_Date = '${date}'`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/closesalebydate/:date", (req, res) => {
  getCloseSaleDate(req.params.date).then((result) => {
    res.json(result[0]);
  });
});

//INSERTclosesale
async function postInsertCloseSale(closeSale) {
  console.log("ข้อมูลจาก closeSale", closeSale);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Cashroundoff (Croff_ID,Croff_Name,Croff_Refno,Croff_Date,Croff_Time,Shop_ID,
          Croff_Round,Croff_Summary,Croff_Docno,Status,Create_Date,Create_User,Croff_cash,Croff_qr,Croff_transfer) 
          VALUES ((SELECT MAX(Croff_ID) FROM Cashroundoff) +1,'ปิดการขาย','','${closeSale.dateTime}',
          '${closeSale.timeSave}','${closeSale.ShopID}','${closeSale.croffRound}','${closeSale.AllCashTotal}'
          ,'${closeSale.closeSaleDoc}','1','${closeSale.dateTime}','${closeSale.personalID}'
          ,'${closeSale.sumCash}','${closeSale.sumQR}','${closeSale.sumTransfer}')`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertclosesale", (req, res) => {
  let closeSale = { ...req.body };
  postInsertCloseSale(closeSale).then((result) => {
    res.status(201).json(result);
  });
});

async function postInsertCloseSaleDetail(closeSaleDetail) {
  let m1000 = parseInt(closeSaleDetail.money1000);
  let m500 = parseInt(closeSaleDetail.money500);
  let m100 = parseInt(closeSaleDetail.money100);
  let m50 = parseInt(closeSaleDetail.money50);
  let m20 = parseInt(closeSaleDetail.money20);
  let m10 = parseInt(closeSaleDetail.money10);
  let m5 = parseInt(closeSaleDetail.money5);
  let m2 = parseInt(closeSaleDetail.money1);
  let m1 = parseInt(closeSaleDetail.money2);
  let m050 = parseInt(closeSaleDetail.money050);
  let m025 = parseInt(closeSaleDetail.money025);

  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Cashroundofflist (Crofflist_ID,Croff_Docno,M_1000,M_500,M_100,M_50,M_20,M_10,M_5,M_2,M_1,M_050,M_025
          ,Crofflist_Summary,Shop_ID,Per_ID_1,Status,Create_Date,Create_User) 
          VALUES ((SELECT MAX(Croff_ID) FROM Cashroundoff),'${closeSaleDetail.closeSaleDoc}','${m1000}','${m500}','${m100}','${m50}','${m20}','${m10}','${m5}'
          ,'${m2}','${m1}','${m050}','${m025}','${closeSaleDetail.totalCash}','${closeSaleDetail.ShopID}'
          ,'${closeSaleDetail.personalID}','0','${closeSaleDetail.dateTime}','${closeSaleDetail.personalID}')`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertclosesaledetail", (req, res) => {
  let closeSaleDetail = { ...req.body };
  postInsertCloseSaleDetail(closeSaleDetail).then((result) => {
    res.status(201).json(result);
  });
});

async function getcloseSaleOff() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Cashroundoff.Croff_ID,Cashroundoff.Croff_Date,Cashroundoff.Croff_Time,Cashroundoff.Shop_ID,
      Cashroundoff.Croff_Name,Cashroundoff.Croff_Summary,Cashroundoff.Croff_Docno,Shop.Shop_Name
      FROM Cashroundoff 
      INNER JOIN Shop ON (Shop.Shop_ID = Cashroundoff.Shop_ID)
      WHERE Cashroundoff.Status = 1 ORDER BY Cashroundoff.Croff_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getclosesaleoff", (req, res) => {
  getcloseSaleOff().then((result) => {
    res.json(result[0]);
  });
});

async function postDelectCashroundoffData(ID) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(`UPDATE Cashroundoff SET Status = 9 WHERE Croff_ID=${ID} `);

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.delete("/delectcashroundoff/:id", (req, res) => {
  postDelectCashroundoffData(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function getCloseSaleDateById(id) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Cashroundoff.Croff_Name,Cashroundoff.Croff_Refno,Cashroundoff.Croff_Date,Cashroundoff.Croff_Time,Cashroundoff.Shop_ID
        ,Cashroundoff.Croff_Round,Cashroundoff.Croff_Summary,Cashroundoff.Croff_Docno,Cashroundoff.Create_User,Shop.Shop_Name
        ,Personal.Per_Name,Personal.Per_Surname,Cashroundoff.Croff_cash,Cashroundoff.Croff_qr,Cashroundoff.Croff_transfer
        ,Cashroundoff.Croff_credit,Cashroundoff.Croff_debtor,Cashroundoff.Croff_withdraw
          FROM Cashroundoff
          INNER JOIN Shop 
          ON Shop.Shop_ID = Cashroundoff.Shop_ID
          INNER JOIN Personal 
          ON Personal.Per_ID = Cashroundoff.Create_User
          WHERE Cashroundoff.Croff_ID = ${id} AND Cashroundoff.Status < 3
          `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getclosesaledatebyid/:id", (req, res) => {
  getCloseSaleDateById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function getCloseSaleDateListById(id) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Cashroundofflist.M_1000,
      Cashroundofflist.M_500,
      Cashroundofflist.M_100,
      Cashroundofflist.M_50,
      Cashroundofflist.M_20,
      Cashroundofflist.M_10,
      Cashroundofflist.M_5,
      Cashroundofflist.M_2,
      Cashroundofflist.M_1,
      Cashroundofflist.M_050,
      Cashroundofflist.M_025,
      Cashroundofflist.Crofflist_Summary,
      Cashroundofflist.Per_ID_2,
      Cashroundofflist.Crofflist_Remark,
      Cashroundofflist.Status,
      Personal.Per_Name,
      Personal.Per_Surname
          FROM Cashroundofflist
          INNER JOIN Personal 
          ON Personal.Per_ID = Cashroundofflist.Per_ID_2
          WHERE Cashroundofflist.Crofflist_ID = ${id} 
          `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getclosesaledatelistbyid/:id", (req, res) => {
  getCloseSaleDateListById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function updateCloseSaleBoData(Id, data) {
  console.log(data);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `UPDATE Cashroundofflist
          SET Crofflist_Remark='${data.croffRemark}',
          Status ='${data.croffStatus}',
          Update_Date='${data.dateTime}',
          Update_Time='${data.timeSave}',
          Update_User='${data.personalID}',
          Per_ID_2 = '${data.personalID}'
          WHERE Crofflist_ID = ${Id}
          `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.put("/updateclosesalebodata/:id", (req, res) => {
  let updateCloseBo = { ...req.body };
  updateCloseSaleBoData(req.params.id, updateCloseBo).then((result) => {
    res.status(201).json(result);
  });
});

module.exports = router;
