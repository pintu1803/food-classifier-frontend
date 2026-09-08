import { useState } from "react";


function App() {

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(event) {

    const selectedFile = event.target.files[0];

    setImage(selectedFile);

    setPreview(
      URL.createObjectURL(selectedFile)
    );
  }


  //Function to handle image prediction
  async function predictImage() {

    //Predict button won't work if image is not selected
    if (!image) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();

    formData.append(
      "file",
      image
    );

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:8000/predict",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();
      setResult(data);
    } 
    catch(error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  }


  return (
    <div>

      <h1>
        Indian Food Classifier
      </h1>


      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />


      {
        image && (
          <p>
            Selected: {image.name}
          </p>
        )
      }

      {
        preview && (
          <img
            src={preview}
            width="300"
            alt="preview"
          />
        )
      } 

      <button onClick={predictImage}>
        Predict
      </button>

      {
        loading && (
          <p>
            Running model...
          </p>
        )
      }


      {
        result && (
          <div>

            <h2>
              Prediction
            </h2>

            <p>
              Food: {result.prediction}
            </p>

            <p>
              Confidence: {
                            (result.confidence * 100).toFixed(2)
                          }%
            </p>

            <p>
              Latency: {result.latency} ms
            </p>

          </div>
        )
      }


      {
        result && result.topK && (

          <div>

            <h3>
              Top Predictions
            </h3>

            {
              result.topK.map(
                (item, index) => (

                  <p key={index}>

                    {index + 1}. {item.label} :

                    {
                      (item.confidence * 100)
                      .toFixed(2)
                    }%

                  </p>

                )
              )
            }
            
          </div>
          
        )
      }

    </div>
  )
}





export default App;