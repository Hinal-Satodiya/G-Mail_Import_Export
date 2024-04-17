const { QueryTypes } = require("sequelize");
const sequelize = require("../utils/Database");

const listProducts = async (req, res) => {
  try {
    const products = await sequelize.query(
      `
      SELECT p.pname, p.price, p.discount_perc, p.SKU,
      p.variant_id, p.description, FORMAT((p.price - (p.price * p.discount_perc/100)),2) as discountedPrice,
      c.cname as cname FROM product p JOIN category c ON p.cid = c.cid;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );
    console.log(products);
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProducts = async (req, res) => {
  const SKU = req.params.SKU;
  console.log(SKU);
  try {
    const [checkSku] = await sequelize.query(
      "select * from products where SKU = ?",
      {
        type: QueryTypes.SELECT,
        replacements: [SKU],
      }
    );

    if (checkSku == undefined) {
      return res.status(404).json({ error: "Product not found" });
    }

    await sequelize.query("delete from products where sku = ?", {
      type: QueryTypes.DELETE,
      replacements: [SKU],
    });

    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  listProducts,
  deleteProducts,
};
