// import package เข้ามาตั้งค่าในระบบ
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const bodyParser = require('body-parser');
const personal = require('./routes/personal')
const products = require('./routes/products')
const productgroup = require('./routes/productsGroup')
const producttype = require('./routes/productType')
const productunit = require('./routes/productUnit')
const customer = require('./routes/customer')
const supplier = require('./routes/supplier')
const saleBo = require('./routes/saleBo')
const closesale = require('./routes/saleClosebo')
const purchase = require('./routes/purchase')
const productRequest = require('./routes/productRequest')
const boReceive = require('./routes/boReceive')
const productMove = require('./routes/productMove')
const productStatusAll = require('./routes/productStatusAll')
//const bodyParser  = require("body-parser")
const sql = require("mssql");
let config = require("./dbconfig");

//getData() //เรียกใช้ function ทดสอบว่า connect ข้อมูลได้มั้ย 

require("dotenv").config() // ทำงานร่วมไฟล์ .env

//สร้างตัว web server ด้วย  express
const app = express()

//ปรับ limit การอัพโหลดไฟล์
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//สร้าง middleware ให้ server ส่ง api ไป client
app.use(express.json())
//app.use(express.static(path.join(__dirname, '../client/build')));
//app.use(express.static())
app.use(cors())
app.use(morgan("dev"))
//app.use(bodyParser.json())

// การสร้าง route

async function getDataProductsUnit() {
    try {
      let pool = await sql.connect(config);
      let res = await pool
        .request()
        .query(
          `SELECT * FROM Productunit WHERE Status = 1 ORDER BY Prod_UID DESC`
        );
      console.log("SQL Connect Success");
      return res.recordsets;
    } catch (error) {
      console.log("SQL Connect Error is " + error);
    }
  }
  
  app.get("/api/productunit", (req, res) => {
  
    getDataProductsUnit().then((result) => {
       res.send(result[0]);
       res.end()
    });

  });

/*
app.use('/api',personal)
app.use('/api',products)
app.use('/api',productgroup)
app.use('/api',producttype)
app.use('/api',productunit)
app.use('/api',customer)
app.use('/api',supplier)
app.use('/api',saleBo)
app.use('/api',closesale)
app.use('/api',purchase)
app.use('/api',productRequest)
app.use('/api',boReceive)
app.use('/api',productMove)
app.use('/api',productStatusAll)*/
//ระบุ Port เอามาจาก .env  แต่หากไม่ได้สร้างใน env ให้นิยามขึ้นมาเอง 
const port = process.env.PORT || 8080
app.listen(port,()=>console.log(`Start server in port ${port}`))

