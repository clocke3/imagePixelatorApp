import { ChangeEvent, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { inclusive_sans } from "../utils/fonts";

type UploadStatus = "idle" | "uploading" | "success" | "error";
interface ErrorMessage {
  id: number;
  message: string;
}

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [pixelPercentage, setPixelPercentage] = useState<string>("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [pixelated, setPixelated] = useState<boolean>(false);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [imageWidth, setImageWidth] = useState<number>(0);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  }

  function handlePixelationPercent(e: ChangeEvent<HTMLInputElement>) {
    const percentage = e.target.value;
    if (
      percentage &&
      (parseInt(percentage) <= 0 || parseInt(percentage) > 100)){
        const percentageError = {
          id: 3, message: "Percentage must be a number between 1 and 100"};
        setErrors([
          ...errors, percentageError
        ]);
      } else {
        if (errors.some((error) => error.id === 3)) {
          errors.splice(errors.findIndex((errors) => errors.id == 3), 1);
        }
        setPixelPercentage(percentage);
      }
  }

  async function handleImageUpload(): Promise<void> {
    if (image === null || !pixelPercentage) {
      if (image === null) {
        console.log('1th if')
        const imageError: ErrorMessage = {
          id: 1, message: "A jpg file must be uploaded" 
        }
        errors.push(imageError);
      }
      if (!pixelPercentage) {
        console.log('2th if')
        setErrors([...errors, { id: 2, message: "A number must be typed" }]);
      }

      console.log(pixelPercentage);
      setStatus("error");
      console.log(status);

      return;
    }

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", image);
    formData.append("pixelSize", pixelPercentage);

    try {
      const resp = await axios.post("/api/pixelate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!resp) {
        setStatus("error");
        throw new Error("Failed to fetch");
      }
      setImageHeight(resp.data.height);
      setImageWidth(resp.data.width);
      setPixelated(true);
    } catch {
      setStatus("error");
    }
    console.log(status);
  }

  return (
    <div className={`${inclusive_sans}`}>
      <div className="content h-screen w-screen flex flex-row">
        <div className="leftSide w-1/2 m-6">
          <div className="title mb-14">
            <p className="text-5xl font-bold">Image Pixelator</p>
          </div>
          <div className="inputContainer grid grid-rows-2 bg-gray-300 rounded-xl mb-5">
            <section>
              <input
                id="fileInput"
                type="file"
                onChange={handleImageChange}
                accept="image/png, image/jpg, image/jpeg"
              />
              {image === null && errors.some((error) => error.id === 1) && (
                <p>
                  {errors.find((error) => error.id == 1)?.message}
                </p>
              )}
            </section>
            <section>
              <label htmlFor="number" className="pr-3">
                {" "}
                What Percentage?{" "}
              </label>
              <input
                id="numberInput"
                type="number"
                placeholder="1 - 100"
                onChange={handlePixelationPercent}
              />
              {!pixelPercentage && errors.some((error) => error.id === 2) && (
                <p className="text-red-500">
                  {errors.find((error) => error.id == 2)?.message}
                </p>
              )}
              {pixelPercentage && errors.some((error) => error.id === 3) && (
                <p className="text-red-500">
                  {errors.find((error) => error.id == 3)?.message}
                </p>
              )}
            </section>
          </div>
          {image instanceof File && pixelPercentage && !errors.some((errors) => errors.id == 3) &&
          (
            <button className="pixelateButton" onClick={handleImageUpload}>
            Pixelate
          </button>
          )}
        </div>
        <div className="rightSide w-1/2 bg-gray-200 relative">
          {pixelated && (
            <div className="newImageRender flex flex-col align-center">
              <Image
                height={imageHeight}
                width={imageWidth}
                src="/images/newImage.jpg"
                alt="newImage"
              />
              <section>
                <p className="text-center text-2xl font-bold m-6">
                  Pixelation done!
                </p>
              </section>
              <section className="ml-36 flex flex-row">
                <button>Try Again</button>
                <a href="/images/newImage.jpg" download="pixelatedImage">
                  <button>Download</button>
                </a>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
