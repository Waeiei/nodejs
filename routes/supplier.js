const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getDataSupplierWhere1() {
  try {
    let pool = await sql.connect(config);
    let res = await pool
      .request()
      .query(`SELECT * FROM Supplier WHERE Status = 1 ORDER BY Sup_ID DESC`);
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/supplierlist", (req, res) => {
    getDataSupplierWhere1().then((result) => {
    res.json(result[0]);
  });
});

async function postInsertSupplierData(supplierData) {
  console.log(supplierData);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request()
      .query(`INSERT INTO Supplier (Sup_ID,Sup_Name,Sup_CName,Sup_TNo,Sup_FNo,Sup_MNo,Sup_Email,Sup_Add_No,Sup_Add_Alley,Sup_Add_Road,Sup_Add_Tambol
        ,Sup_Add_Diatrict,Sup_Add_Province,Sup_Postcode,Status,Create_Date,Create_User,Update_Time,Sup_TaxID,Sup_LineID) VALUES ((SELECT MAX(Sup_ID) FROM Supplier) +1,'${supplierData.supName}',
        '${supplierData.supCName}',${supplierData.supTNo},'${supplierData.supFNo}','${supplierData.supMNo}','${supplierData.supEmail}'
          ,'${supplierData.supAddNo}','${supplierData.supAddAlley}','${supplierData.supAddRoad}','${supplierData.supAddTambol}',
          '${supplierData.supAddDiatrict}','${supplierData.supAddProvince}'
          ,'${supplierData.supPostcode}',1,'${supplierData.dateTime}'
          ,'${supplierData.personalID}','${supplierData.timeSave}','${supplierData.supTaxID}','${supplierData.supLine}')`);
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.post("/products/insertsupplier", (req, res) => {
  let supplier = { ...req.body };
  postInsertSupplierData(supplier).then((result) => {
    res.status(201).json(result);
  });
});

async function getDataSupplierById(id) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Supplier.Sup_Name,Supplier.Sup_CName,Supplier.Sup_TaxID,Supplier.Sup_TNo,Supplier.Sup_FNo,
          Supplier.Sup_MNo,Supplier.Sup_LineID,Supplier.Sup_Email,Supplier.Sup_Add_No,Supplier.Sup_Add_Alley,
          Supplier.Sup_Add_Road,Supplier.Sup_Add_Tambol,Supplier.Sup_Add_Diatrict,Supplier.Sup_Add_Province,Supplier.Sup_Postcode
          FROM Supplier
          WHERE Supplier.Sup_ID = ${id}
          `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/products/getDatasupplierbyid/:id", (req, res) => {
    getDataSupplierById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

async function updatesupplierData(Id,data) {
    console.log(data);
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `UPDATE Supplier
          SET Sup_Name='${data.supName}',
          Sup_CName='${data.supCName}',
          Sup_TaxID='${data.supTaxID}',
          Sup_TNo='${data.supTNo}',
          Sup_FNo='${data.supFNo}',
          Sup_MNo='${data.supMNo}',
          Sup_LineID='${data.supLine}',
          Sup_Email='${data.supEmail}',
          Sup_Add_No='${data.supAddNo}',
          Sup_Add_Alley='${data.supAddAlley}',
          Sup_Add_Road='${data.supAddRoad}',
          Sup_Add_Tambol='${data.supAddTambol}',
          Sup_Add_Diatrict='${data.supAddDiatrict}',
          Sup_Add_Province='${data.supAddProvince}',
          Sup_Postcode='${data.supPostcode}',
          Update_Date='${data.dateTime}',
          Update_Time='${data.timeSave}',
          Update_User='${data.personalID}'
          WHERE Sup_ID = ${Id}
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.put("/products/updatesupplierdata/:id", (req, res) => {
    let updateSupplier = { ...req.body };
    updatesupplierData(req.params.id,updateSupplier).then((result) => {
      res.status(201).json(result);
    });
  });

  async function postDelectSupplierData(supid) {
    try {
      let pool = await sql.connect(config);
  
      let res = await pool
        .request()
        .query(`UPDATE Supplier SET Status = 9 WHERE Sup_ID=${supid} `);
  
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.delete("/products/delectsupplier/:id", (req, res) => {
    postDelectSupplierData(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });


module.exports = router;
