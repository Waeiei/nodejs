const express = require("express");
const router = express.Router();

const sql = require("mssql");
let config = require("../dbconfig");

async function getDataProducts() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Product.Prod_GID,Product.Prod_ID,Product.Prod_Bar1,Product.Prod_Name,Product.Prod_Price_Std,Product.Prod_Price,
        Productunit.Prod_UName,Product.Prod_Picture1,Product.Prod_Picture2,Product.Prod_Picture3,Product.Prod_Picture4 FROM Product 
        INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID) WHERE Product.Status = 1  ORDER BY Prod_ID DESC`
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function postInsertProductData(productsData) {
  console.log(productsData);

  try {
    let pool = await sql.connect(config);

    let res = await pool.request()
      .query(`INSERT INTO Product (Prod_ID,Prod_Name,Prod_PType,Prod_Price,Prod_Bar1,
            Prod_Price_Std,Prod_Price_Avg,Prod_Price_Last,Prod_UID,Prod_GID,Prod_TID,
            Prod_Remark,Sup_ID,Prod_Picture1,Prod_Picture2,Prod_Picture3,Prod_Picture4,Status,Create_Date,Create_User
            ,Prod_Bar2,Prod_Bar3,Prod_Bar4,Prod_Bar5,Prod_Bar6,Prod_Bar7,Prod_Bar8,Prod_Bar9,Update_Time) 
        VALUES ((SELECT MAX(Prod_ID) FROM Product) +1,'${productsData.prodName}','${productsData.prodCheckbox}',
        '${productsData.prodPrice}','${productsData.prodBarcode}',
        ${productsData.prodStd},${productsData.prodAvg},${productsData.prodLast},'${productsData.prodUID}',
        '${productsData.prodGID}','${productsData.prodTID}',
        '${productsData.prodRemark}',${productsData.searchValue},'${productsData.prodPic1}','${productsData.prodPic2}',
        '${productsData.prodPic3}','${productsData.prodPic4}',1,'${productsData.prodDate}','${productsData.personalID}',
        '${productsData.prodBarcode2}','${productsData.prodBarcode3}','${productsData.prodBarcode4}','${productsData.prodBarcode5}'
        ,'${productsData.prodBarcode6}','${productsData.prodBarcode7}','${productsData.prodBarcode8}','${productsData.prodBarcode9}'
        ,'${productsData.timeSave}')`);
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function postDelectProductData(productsID) {
  try {
    let pool = await sql.connect(config);

    let res = await pool
      .request()
      .query(`UPDATE Product SET Status = 0 WHERE Prod_ID=${productsID} `);

    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function getProductType() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query("SELECT * FROM Producttype");
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}


async function getDataProductsById(Id) {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Product.Prod_ID,Product.Prod_Bar1,Product.Prod_Name,Product.Prod_Price_Std,Product.Prod_Price,
        Product.Prod_Price_Avg,Product.Prod_Price_Last,Product.Prod_Remark,Productunit.Prod_UID,Product.Prod_GID,Product.Prod_TID,
        Product.Sup_ID,Product.Prod_Picture1,Product.Prod_Picture2,Product.Prod_Picture3,Product.Prod_Picture4,
        Product.Create_Date,Product.Prod_PType,Supplier.Sup_Name,Supplier.Sup_CName,Productunit.Prod_UName,Producttype.Prod_TName,
        Productgroup.Prod_GName,Product.Prod_Bar2,Product.Prod_Bar3,Product.Prod_Bar4,Product.Prod_Bar5,Product.Prod_Bar6
        ,Product.Prod_Bar7,Product.Prod_Bar8,Product.Prod_Bar9,Product.Update_Date
        FROM Product 
        INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID)  
        INNER JOIN Supplier ON (Product.Sup_ID = Supplier.Sup_ID) 
        INNER JOIN Producttype ON (Product.Prod_TID = Producttype.Prod_TID) 
        INNER JOIN Productgroup ON (Product.Prod_GID = Productgroup.Prod_GID) 
        WHERE Product.Prod_ID = ${Id} `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function updateProductData(Id, data) {
  console.log(data);
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `UPDATE Product
        SET Prod_Bar1='${data.UpdateprodBarcode}',
        Prod_Name='${data.UpdateprodName}',
        Prod_Price ='${data.UpdateprodPrice}',
        Prod_Price_Std ='${data.UpdateprodStd}',
        Prod_Price_Avg ='${data.UpdateprodAvg}',
        Prod_Price_Last ='${data.UpdateprodLast}',
        Prod_Picture1 ='${data.UpdateprodPic1}',
        Prod_Picture2 ='${data.UpdateprodPic2}',
        Prod_Picture3 ='${data.UpdateprodPic3}',
        Prod_Picture4 ='${data.UpdateprodPic4}',
        Prod_PType = '${data.convertPtype}',
        Prod_Bar2 = '${data.UpdateprodBarcode2}',
        Prod_Bar3 = '${data.UpdateprodBarcode3}',
        Prod_Bar4 = '${data.UpdateprodBarcode4}',
        Prod_Bar5 = '${data.UpdateprodBarcode5}',
        Prod_Bar6 = '${data.UpdateprodBarcode6}',
        Prod_Bar7 = '${data.UpdateprodBarcode7}',
        Prod_Bar8 = '${data.UpdateprodBarcode8}',
        Prod_Bar9 = '${data.UpdateprodBarcode9}',
        Update_Date = '${data.updateDateSQL}',
        Update_Time = '${data.timeSave}',
        Prod_UID = '${data.UpdateprodUID}',
        Prod_TID = '${data.UpdateprodTID}',
        Prod_GID = '${data.UpdateprodGID}'

        WHERE Prod_ID = ${Id}
        `
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

async function getDataProductsSet() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query(
      `SELECT Product.Prod_ID,Product.Prod_Bar1,Product.Prod_Name,Product.Prod_Price_Std,Product.Prod_Price_Avg,Product.Prod_Price,
        Productunit.Prod_UName,Product.Prod_Picture1,Product.Prod_Picture2,Product.Prod_Picture3,Product.Prod_Picture4 FROM Product 
        INNER JOIN Productunit ON (Product.Prod_UID = Productunit.Prod_UID) WHERE Product.Prod_PType = '02' AND Product.Status = 1`
    );
    console.log("SQL Connect Success");
    return res.recordsets;
  } catch (error) {
    console.log("SQL Connect Error is " + error);
  }
}

router.get("/products", (req, res) => {
  getDataProducts().then((result) => {
    res.json(result[0]);
  });
});

router.get("/producttype", (req, res) => {
  getProductType().then((result) => {
    res.json(result[0]);
  });
});

router.post("/products/insertproduct", (req, res) => {
  let products = { ...req.body };
  postInsertProductData(products).then((result) => {
    res.status(201).json(result);
  });
});

router.delete("/products/delectproduct/:id", (req, res) => {
  postDelectProductData(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

router.get("/products/getdataproductbyid/:id", (req, res) => {
  getDataProductsById(req.params.id).then((result) => {
    res.status(201).json(result);
  });
});

router.put("/products/updateproductdata/:id", (req, res) => {
  let updateProduct = { ...req.body };
  updateProductData(req.params.id, updateProduct).then((result) => {
    res.status(201).json(result);
  });
});

router.get("/products/getDataProductsSet", (req, res) => {
  getDataProductsSet().then((result) => {
    res.json(result[0]);
  });
});

module.exports = router;
