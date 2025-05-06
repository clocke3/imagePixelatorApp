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

  return (
    <div>
      <div className="inputContainer grid grid-rows-2">
        <section className="chooseFileContainer">
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/png, image/jpg, image/jpeg"
          />
        </section>
        <section className="percentContainer">
          <label htmlFor="number"> What Percentage? </label>
          <input type="number" onChange={handlePixelationPercent} />
        </section>
      </div>
      {image && status !== "uploading" && (
        <button
          className="bg-blue-400 rounded-lg text-white"
          onClick={handleImageUpload}
        >
          {" "}
          Pixelate{" "}
        </button>
      )}

      {pixelated && (
        <div>
          <Image
            height={imageHeight}
            width={imageWidth}
            src="/images/newImage.jpg"
            alt="newImage"
          />
        </div>
      )}

      {status === "success" && <p>Image uploaded successfully!</p>}

      {status === "error" && <p>Image upload failed...</p>}
    </div>
  );
}
