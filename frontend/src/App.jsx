import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [getData, setGetData] = useState([]);
  useEffect(() => {
      fetchAllData();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("doc", selectedFile);

      const response = await axios.post(
        "http://localhost:3000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(`9 Rows Are Inserted Sucessfully!!`);
      if (response.status == 200) {
        console.log("Successfully send");
      }
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response?.data?.error || error
      );
      console.error(
        "Error uploading file: " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  const fetchAllData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/products");
      if (response.status == 200) {
        setGetData(response.data);
        
      }
    } catch (error) {
      console.log(error);
    }
  };


  const onClickExportData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/export", {
        responseType: "arraybuffer",
      });

      if (response.status === 200) {
        console.log("Response data:", response.data);

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${Date.now()}-exported_data.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const columns = [
    {
      field: "pname",
      headerName: "Product Name",
      width: 200,
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      width: 120,
    },
    {
      field: "discount_perc",
      headerName: "Discount %",
      width: 140,
    },
    { field: "SKU", headerName: "SKU", type: "number", width: 150, editable: true },
    {
      field: "variant_id",
      headerName: "Variant ID",
      type: "number",
      width: 120,
    },
    {
      field: "description",
      headerName: "Description",
      width: 450,
    },
    {
      field: "discountedPrice",
      headerName: "Discounted Price",
      type: "number",
      width: 250,
    },


    {
      field: "cname",
      headerName: "Category Name",
      width: 130,
    },


  ];



  const deleteRecord = async (SKU) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/delete/${sku}`
      );

      if (response.status == 200) {
        console.log(response.data.status);
        fetchAllData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const rowss = getData.map((product) => ({
    ...product,
    id: product.SKU
  }))

 
  return (
    <>
      <div className="mt-3">
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleFileChange} /><br />
          <button type="submit" className="btn btn-secondary m-2" disabled={!selectedFile}>
            Upload
          </button>
        </form>
        <button
          type="button"
          className="btn btn-secondary m-2"
          onClick={onClickExportData}
        >
          Export
        </button>
      </div>

      <div>
        <DataGrid
          rows={rowss}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          disableSelectionOnClick
        />

      </div>
    </>
  );
}

export default App;
