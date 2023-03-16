const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function postInsertProductMove(move) {
  console.log("ข้อมูลจาก move", move);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Productmove (Pmove_ID,Pmove_Type,Pmove_Refno,Pmove_Date,Pmove_Time,Shop_ID_1,
        Shop_ID_2,Pmove_Remark,Status,Create_Date,Create_User,Pmove_Docno,Pmove_Total,Pmove_TotalQty) 
          VALUES ((SELECT MAX(Pmove_ID) FROM Productmove) +1,'${move.moveType}','${move.moveRefno}','${move.moveDate}','${move.timeSave}','${move.moveShop1}','${move.moveShop2}'
          ,'${move.moveRemark}','0','${move.dateTime}','${move.personalID}','${move.moveDocno}','${move.calSum}','${move.calCount}' )`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertproductmove", (req, res) => {
  let move = { ...req.body };
  postInsertProductMove(move).then((result) => {
    res.status(201).json(result);
  });
});

async function postInsertMoveList(movelist) {
  console.log("ข้อมูลจาก movelist", movelist);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Productmovelist (Prod_ID,Pmovelist_Qty,Status,Create_Date,Create_User,Pmove_Docno) 
            VALUES ('${movelist.prodListID}',
            '${movelist.prodListCount}','1','${movelist.dateTime}','${movelist.personalID}'
            ,'${movelist.moveDocno}')`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertmovelist", (req, res) => {
  let movelist = { ...req.body };
  postInsertMoveList(movelist).then((result) => {
    res.status(201).json(result);
  });
});

async function getDataProductMove() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Pmove_ID,Pmove_Type,Pmove_Refno,Pmove_Date,Pmove_Time,
          Shop_ID_1,Shop_ID_2,Pmove_Remark,Status,Pmove_Docno,Pmove_Total,Pmove_TotalQty
          FROM Productmove
          WHERE Status < 3 ORDER BY Pmove_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductmove", (req, res) => {
  getDataProductMove().then((result) => {
    res.json(result[0]);
  });
});

async function getProductMoveById(iddoc) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Productmove.Pmove_Type,Productmove.Pmove_Refno,Productmove.Pmove_Date,Productmove.Pmove_Time
        ,Productmove.Shop_ID_1,Productmove.Shop_ID_2,Productmove.Pmove_Remark,Productmove.Status,Productmove.Pmove_Docno,
        Productmove.Pmove_Total,Productmove.Pmove_TotalQty,Productmove.Create_User,Personal.Per_Name,Personal.Per_Surname
      FROM Productmove
      INNER JOIN Personal ON (Personal.Per_ID = Productmove.Create_User)
      WHERE Productmove.Pmove_Docno = ${iddoc} AND Productmove.Status < 3 
      `);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductmovebyid/:iddoc", (req, res) => {
  console.log(req.params.iddoc);
  getProductMoveById(req.params.iddoc).then((result) => {
    res.status(201).json(result);
  });
});

async function getProductmoveListById(iddoc) {
    try {
      let pool = await sql.connect(config);
      let res = await pool.request()
        .query(`SELECT Productmovelist.Pmove_Docno,Productmovelist.Prod_ID,Productmovelist.Pmovelist_Qty,
        Product.Prod_Price,Product.Prod_Name,Product.Prod_UID,Productunit.Prod_UName
        ,Productmove.Shop_ID_1,Shopdetail.Sdetail_Balance
      FROM Productmovelist
      INNER JOIN Product ON (Product.Prod_ID = Productmovelist.Prod_ID)
      INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID)
      INNER JOIN Productmove ON (Productmove.Pmove_Docno = Productmovelist.Pmove_Docno)
      INNER JOIN Shopdetail ON (Shopdetail.Shop_ID = Productmove.Shop_ID_1)
      WHERE Productmovelist.Pmove_Docno = ${iddoc} AND Productmovelist.Status = 1 AND Productmove.Shop_ID_1 = Shopdetail.Shop_ID AND Shopdetail.Prod_ID = Productmovelist.Prod_ID
      `);
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.get("/getproductmovelistbyid/:iddoc", (req, res) => {
    getProductmoveListById(req.params.iddoc).then((result) => {
      res.status(201).json(result);
    });
  });

  async function updateProductmove(iddoc,data) {
    console.log(data);
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `UPDATE Productmove
          SET Update_Date='${data.dateTime}',
          Update_Time='${data.timeSave}',
          Update_User='${data.personalID}',
          Status = '${data.moveStatus}'
          WHERE Pmove_Docno = ${iddoc}
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.put("/updateproductmove/:iddoc", (req, res) => {
    let updatemove = { ...req.body };
    updateProductmove(req.params.iddoc,updatemove).then((result) => {
      res.status(201).json(result);
    });
  });

  async function postDelectProductMoveData(id) {
    try {
      let pool = await sql.connect(config);
  
      let res = await pool
        .request()
        .query(`UPDATE Productmove SET Status = 9 WHERE Pmove_ID=${id} `);
  
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.delete("/delectProductmove/:id", (req, res) => {
    postDelectProductMoveData(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });
  

module.exports = router;
