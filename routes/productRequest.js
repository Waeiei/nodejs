const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function postInsertTreq(treq) {
  console.log("ข้อมูลจาก treq", treq); 
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `INSERT INTO Productreq (Req_ID,Req_Name,Req_Date,Req_Time,Shop_ID_1,Shop_ID_2,
        Req_Remark,Status,Create_Date,Create_User,Req_Docno,Req_Total,Req_TotalQty) 
          VALUES ((SELECT MAX(Req_ID) FROM Productreq) +1,'ขอเบิกสินค้า','${treq.treqDate}',
          '${treq.timeSave}','${treq.treqShopId}','${treq.treqShopIdReceive}','${treq.treqRemark}'
          ,'0','${treq.dateTime}','${treq.personalID}','${treq.treqDoc}','${treq.calSum}','${treq.calCount}' )`
    );

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/insertproducttreq", (req, res) => {
  let treq = { ...req.body };
  postInsertTreq(treq).then((result) => {
    res.status(201).json(result);
  });
});

async function postInsertTreqList(treqList) {
    console.log("ข้อมูลจาก treqList", treqList); 
    try {
      let pool = await sql.connect(config);
      let res = await pool.request().query(
        `INSERT INTO Productreqlist (Prod_ID,Reqlist_Qty,Status,Create_Date,Create_User,Req_Docno) 
            VALUES ('${treqList.prodListID}',
            '${treqList.prodListCount}','1','${treqList.dateTime}','${treqList.personalID}','${treqList.treqDoc}')`
      );
  
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  router.post("/insertproducttreqlist", (req, res) => {
    let treqList = { ...req.body };
    postInsertTreqList(treqList).then((result) => {
      res.status(201).json(result);
    });
  });


async function getProductreq() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Req_ID,Req_Name,Req_Date,Req_Time,Shop_ID_1
      ,Shop_ID_2,Req_Remark,Req_Docno,Req_Total,Req_TotalQty,Status
      FROM Productreq 
      WHERE Status <3 ORDER BY Req_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductreq", (req, res) => {
  getProductreq().then((result) => {
    res.json(result[0]);
  });
});

async function getProductreqById(iddoc) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Productreq.Req_Name,Productreq.Req_Date,Productreq.Req_Time,Productreq.Shop_ID_1
      ,Productreq.Shop_ID_2,Productreq.Req_Remark,Productreq.Req_Docno,Productreq.Status,Productreq.Update_User,
      Productreq.Req_Total,Productreq.Req_TotalQty,Productreq.Create_User,Personal.Per_Name,Personal.Per_Surname
    FROM Productreq
    INNER JOIN Personal ON (Personal.Per_ID = Productreq.Create_User)
    WHERE Productreq.Req_Docno = ${iddoc} AND Productreq.Status < 3
    `);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductreqbyid/:iddoc", (req, res) => {
  console.log(req.params.iddoc);
  getProductreqById(req.params.iddoc).then((result) => {
    res.status(201).json(result);
  });
});

async function getProductreqListById(iddoc) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`SELECT Productreqlist.Req_Docno,Productreqlist.Prod_ID,Productreqlist.Reqlist_Qty,
      Product.Prod_Price,Product.Prod_Name,Product.Prod_UID,Productunit.Prod_UName
      ,Productreq.Shop_ID_1,Shopdetail.Sdetail_Balance
    FROM Productreqlist
    INNER JOIN Product ON (Product.Prod_ID = Productreqlist.Prod_ID)
    INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID)
    INNER JOIN Productreq ON (Productreq.Req_Docno = Productreqlist.Req_Docno)
    INNER JOIN Shopdetail ON (Shopdetail.Shop_ID = Productreq.Shop_ID_1)
    WHERE Productreqlist.Req_Docno = ${iddoc} AND Productreqlist.Status = 1 AND Productreq.Shop_ID_1 = Shopdetail.Shop_ID AND Shopdetail.Prod_ID = Productreqlist.Prod_ID
    `);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/getproductreqlistbyid/:iddoc", (req, res) => {
  getProductreqListById(req.params.iddoc).then((result) => {
    res.status(201).json(result);
  });
});


async function postDelectProductreqData(iddoc) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(`UPDATE Productreq SET Status = 9 WHERE Req_Docno=${iddoc} `);

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.delete("/delectProductreq/:iddoc", (req, res) => {
  postDelectProductreqData(req.params.iddoc).then((result) => {
    res.status(201).json(result);
  });
});

async function postDelectProductreqListData(iddoc) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(`UPDATE Productreqlist SET Status = 9 WHERE Req_Docno=${iddoc} `);

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.delete("/delectProductreqlist/:iddoc", (req, res) => {
  postDelectProductreqListData(req.params.iddoc).then((result) => {
    res.status(201).json(result);
  });
});

async function updateProductreq(iddoc,data) {
  console.log(data);
  try {
    let pool = await sql.connect(config);
    let res = await pool
      .request()
      .query(
        `UPDATE Productreq
        SET Update_Date='${data.dateTime}',
        Update_Time='${data.timeSave}',
        Update_User='${data.personalID}',
        Status = '${data.treqStatus}'
        WHERE Req_Docno = ${iddoc}
        `
      );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.put("/updateproductreq/:iddoc", (req, res) => {
  let updatetreq = { ...req.body };
  updateProductreq(req.params.iddoc,updatetreq).then((result) => {
    res.status(201).json(result);
  });
});


module.exports = router;
