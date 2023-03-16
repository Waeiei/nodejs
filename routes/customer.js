const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getDataCustomer() {
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `SELECT * FROM Customer WHERE Status = 1 ORDER BY Cus_ID DESC`
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.get("/customer", (req, res) => {
    getDataCustomer().then((result) => {
      res.json(result[0]);
    });
  });

  async function getDataCustomerGroup() {
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `SELECT * FROM Customergroup`
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.get("/customergroup", (req, res) => {
    getDataCustomerGroup().then((result) => {
      res.json(result[0]);
    });
  });

  async function postInsertCustomerData(customerData) {
    console.log(customerData);
    try {
      let pool = await sql.connect(config);
      let res = await pool.request()
      .query(`INSERT INTO Customer (Cus_ID,ID_Student,Cus_Year,Cus_PreName,Cus_Name,Cus_BirthDate,Cus_CitizenID,Cus_GID,Cus_TNo,Cus_MNo,Cus_Email
        ,Cus_Add_No,Cus_Add_Alley,Cus_Add_Road,Cus_Add_Tambol,Cus_Add_Diatrict,Cus_Add_Province,Cus_Postcode,Status
        ,Create_Date,Create_User,Update_Time) VALUES ((SELECT MAX(Cus_ID) FROM Customer) +1,${customerData.cusStudentId},${customerData.cusYear},'${customerData.cusPreName}','${customerData.cusName}','${customerData.BirthDate}',
        '${customerData.cusCitizenID}',${customerData.cusGID},'${customerData.cusTNo}','${customerData.cusMNo}','${customerData.cusEmail}'
          ,'${customerData.cusAddNo}','${customerData.cusAddAlley}','${customerData.cusAddRoad}','${customerData.cusAddTambol}',
          '${customerData.cusAddDiatrict}','${customerData.cusAddProvince}','${customerData.cusPostcode}','${customerData.status}'
          ,'${customerData.dateTime}',${customerData.personalID},'${customerData.timeSave}')`)
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.post("/products/insertcustomer", (req, res) => {
    let customer = { ...req.body };
    postInsertCustomerData(customer).then((result) => {
      res.status(201).json(result);
    });
  });

  async function getDataCustomerById(id) {
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `SELECT Customer.ID_Student,Customer.Cus_Year,Customer.Cus_PreName,Customer.Cus_Name,Customer.Cus_BirthDate,
          Customer.Cus_CitizenID,Customer.Cus_GID,Customer.Cus_TNo,Customer.Cus_MNo,Customer.Cus_Email,
          Customer.Cus_Add_No,Customer.Cus_Add_Alley,Customer.Cus_Add_Road,Customer.Cus_Add_Tambol,Customer.Cus_Add_Diatrict,
          Customer.Cus_Add_Province,Customer.Cus_Postcode,Customer.Cus_Sumtotal,Customergroup.Cus_GName
          FROM Customer
          INNER JOIN Customergroup ON (Customer.Cus_GID = Customergroup.Cus_GID)
          WHERE Customer.Cus_ID = ${id}
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.get("/products/getDatacustomerbyid/:id", (req, res) => {
    getDataCustomerById(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });

  async function updateCustomerData(Id,data) {
    console.log(data);
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `UPDATE Customer
          SET ID_Student='${data.cusStudentId}',
          Cus_Year='${data.cusYear}',
          Cus_PreName='${data.cusPreName}',
          Cus_Name='${data.cusName}',
          Cus_BirthDate='${data.BirthDate}',
          Cus_CitizenID='${data.cusCitizenID}',
          Cus_GID='${data.cusGID}',
          Cus_TNo='${data.cusTNo}',
          Cus_MNo='${data.cusMNo}',
          Cus_Email='${data.cusEmail}',
          Cus_Add_No='${data.cusAddNo}',
          Cus_Add_Alley='${data.cusAddAlley}',
          Cus_Add_Road='${data.cusAddRoad}',
          Cus_Add_Tambol='${data.cusAddTambol}',
          Cus_Add_Diatrict='${data.cusAddDiatrict}',
          Cus_Add_Province='${data.cusAddProvince}',
          Cus_Postcode='${data.cusPostcode}',
          Update_Date='${data.toDate}',
          Update_Time='${data.timeSave}',
          Update_User='${data.personalID}'
          WHERE Cus_ID = ${Id}
          `
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.put("/products/updateCustomerdata/:id", (req, res) => {
    let updateCustomer = { ...req.body };
    updateCustomerData(req.params.id,updateCustomer).then((result) => {
      res.status(201).json(result);
    });
  });

  async function postDelectCustomerData(cusID) {
    try {
      let pool = await sql.connect(config);
  
      let res = await pool
        .request()
        .query(`UPDATE Customer SET Status = 9 WHERE Cus_ID=${cusID} `);
  
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }

  router.delete("/products/delectcustomer/:id", (req, res) => {
    postDelectCustomerData(req.params.id).then((result) => {
      res.status(201).json(result);
    });
  });

module.exports = router;