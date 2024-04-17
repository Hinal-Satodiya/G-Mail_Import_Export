const sequelize = require("../utils/Database");
const path = require("path");
const { QueryTypes } = require("sequelize");
const { sendEmail } = require("../controllers/EmailController");


const XLSX = require("xlsx");

const welcome = (req, res) => {
  res.send("hello");
};

const uploadDoc = async (req, res) => {
  try {
    const duplicateRecords = [];
    const document = req.file;
    console.log(document);
    const workbook = XLSX.readFile(
      path.join(__dirname, "../uploads/" + document.filename)
    );
    const sheet_name_list = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    const rows = xlData.length;
    for (let i = 0; i < xlData.length; i++) {
      console.log(i);
      const data = xlData[i];
      console.log(data.variant_id);
      const [checkVariantId] = await sequelize.query(
        "select * from product where variant_id = ?",
        {
          type: QueryTypes.SELECT,
          replacements: [data.variant_id],
        }
      );console.log(checkVariantId);
      if (checkVariantId != undefined) {
        duplicateRecords.push(data);
        console.log(duplicateRecords);
      } else {
        console.log("in");
        await sequelize.query(
          `
          INSERT INTO product (pname,SKU,variant_id,discount_perc,description,price,cid) VALUES (?, ?, ? ,? ,?, ?,?)
          `,
          {
            type: QueryTypes.INSERT,
            replacements: [
              data.pname,
              data.SKU,
              data.variant_id,
              data.discount_perc,
              data.description,
              data.price,
              data.cid,
            ],
          }
        );
      }
    }
    
    //Send the email
    sendEmail(document, rows, duplicateRecords);

    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: "Internal server error" });
  }
};

const exportDoc = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT p.pname, p.SKU, p.variant_id, p.description, c.cname, 
       FORMAT((p.price - (p.price * p.discount_perc/100)), 2) as discountedPrice 
       FROM product p 
       JOIN category c ON p.cid = c.cid;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).send("No data found");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        "pname",
        "SKU",
        "variant_id",
        "description",
        "cname",
        "discountedPrice", // Include the discountedPrice in the header
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product_Data");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Product_Data.xlsx"
    );

    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


module.exports = {
  welcome,
  uploadDoc,
  exportDoc,
};
