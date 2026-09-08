import { useState } from "react";
import { useRef } from "react";


function App() {

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  //Upload image functionality
  function handleImageChange(event) {

    const selectedFile = event.target.files[0];

    setImage(selectedFile);

    setPreview(
      URL.createObjectURL(selectedFile)
    );

    // clear previous error
    setError(null);
  }


  //Function to handle image prediction
  async function predictImage() {

    //Clear old errors.
    setError(null);

    //Predict button won't work if image is not selected
    if (!image) {
      // alert("Please select an image"); //This is a browser pop up error
      setError("Please select an image first");
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

      if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      const data = await response.json();
      setResult(data);
    } 
    catch(error) {
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  function reset(){
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);

    //clear file name after reset
    fileInputRef.current.value = "";
  }

  return (
    <div>

      <h1>
        Indian Food Classifier
      </h1>


      <input
        ref={fileInputRef}
        id="fileUpload"
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

      <button onClick={reset}>
        Reset
      </button>

      {
        error && (
          <p>
            {error}
          </p>
        )
      }

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