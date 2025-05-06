/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChangeEvent, useState } from "react";
import axios from "axios";
import Image from "next/image";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [pixelPercentage, setPixelPercentage] = useState<string>("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [pixelated, setPixelated] = useState<boolean>(false);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [imageWidth, setImageWidth] = useState<number>(0);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  }

  function handlePixelationPercent(e: ChangeEvent<HTMLInputElement>) {
    const percentage = e.target.value;
    if (percentage && (parseInt(percentage) > 0 || parseInt(percentage) < 100))
      setPixelPercentage(percentage);
  }

  async function handleImageUpload(): Promise<void> {
    if (!image || !pixelPercentage) return;

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

  async function downloadImage(): Promise<void> {}

  return (
    <div>
      <div className="content h-screen w-screen flex flex-row">
        <div className="leftSide w-1/2 m-6">
          <div className="title mb-14">
            <p className="text-5xl font-bold">Image Pixelator</p>
          </div>
          <div className="inputContainer grid grid-rows-2 bg-gray-300 rounded-xl mb-5">
            <section className="chooseFileContainer rounded-lg">
              <input
                id="fileInput"
                type="file"
                onChange={handleImageChange}
                accept="image/png, image/jpg, image/jpeg"
              />
            </section>
            <section className="percentContainer">
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
            </section>
          </div>
          <button className="float-right" onClick={handleImageUpload}>
            Pixelate
          </button>
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
                <p className="text-center text-2xl font-bold m-6">Pixelation done!</p>
              </section>
              <section className="ml-36 flex flex-row">
                <button>Try Again</button>
                <button onClick={downloadImage}>Download</button>
              </section>
            </div>
          )}
          {status === "error" && <p>Image upload failed...</p>}
        </div>
      </div>
    </div>
  );
}
