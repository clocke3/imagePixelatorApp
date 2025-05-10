import { ChangeEvent, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { inclusive_sans } from "../utils/fonts";
import Spinner from "./Spinner";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [pixelPercentage, setPixelPercentage] = useState<string>("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [percentageError, setPercentageError] = useState<string>("");
  const [pixelated, setPixelated] = useState<boolean>(false);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [imageWidth, setImageWidth] = useState<number>(0);

  // Ref object to reference the input element
  const imageRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  }

  async function handlePixelationPercent(e: ChangeEvent<HTMLInputElement>) {
    const percentage = e.target.value;
    if (
      percentage &&
      (parseInt(percentage) <= 0 || parseInt(percentage) > 100)
    ) {
      const message = "Percentage must be a number from 1 to 100";
      setPercentageError(message);
    } else {
      if (percentageError) setPercentageError("");
      setPixelPercentage(percentage);
    }
    console.log("Pixel percentage: " + pixelPercentage);
  }

  async function handleImageUpload(): Promise<void> {
    if (image instanceof File && pixelPercentage) {
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
    }
    console.log(status);
  }

  function handleReset() {
    setImage(null);
    setPixelPercentage("");
    setStatus('idle');
    setPercentageError("");
    setPixelated(false);
    setImageHeight(0);
    setImageWidth(0);
    if (imageRef.current) {
      imageRef.current.value = '';
      imageRef.current.type = "text";
      imageRef.current.type = "file";
    }
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
                ref={imageRef}
                onChange={handleImageChange}
                accept="image/png, image/jpg, image/jpeg"
              />
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
                value={pixelPercentage}
                onChange={handlePixelationPercent}
              />
              {pixelPercentage && percentageError && (
                <p className="text-red-500">{percentageError}</p>
              )}
            </section>
          </div>
          {image instanceof File &&
            pixelPercentage &&
            percentageError == "" && 
            !pixelated && (
              <button className="pixelateButton flex flex-row items-center justify-center" onClick={handleImageUpload}>
                {status == 'uploading' && !pixelated &&(
                  <div className="pr-2.5">
                    <Spinner/>
                  </div>
                )}
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
                <button onClick={handleReset}>Try Again</button>
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
