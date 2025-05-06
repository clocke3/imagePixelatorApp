import { Jimp } from 'jimp';
import * as fs from 'fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const percentageString = formData.get('pixelSize') as string;
    const percentage = parseInt(percentageString);
    // save file to public jpeg file
    const saved = await saveImage(file);
    if (!saved){
      return new Response(
        JSON.stringify({
          message: "Could not save file",
        }),
        { status: 400 }
      );
    }

    const image = await Jimp.read('public/images/oldImage.jpg');

    image.pixelate(percentage).write('public/images/newImage.jpg');
    return new Response(
      JSON.stringify({
        height: image.height,
        width: image.width,
        message: "Success!",
      }),
      { status: 200 }
    );


  } catch {
    return new Response(
      JSON.stringify({
        error: "Failed to parse request body",
      }),
      { status: 400 }
    );
  }
}

async function saveImage(file: File): Promise<boolean> {
  const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    // write contents of file to jpeg
    try {
      fs.writeFileSync('public/images/oldImage.jpg', buffer);
      console.log('Image saved successfully');
      return true;
  } catch {
    console.log('Image could not be saved...');
    return false;
  }
}
